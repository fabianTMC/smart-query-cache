/// <reference path="../typings/q.d.ts"/>

import * as fs from "fs";
import * as Q from "q";

import {DatabaseConnectionConfig} from "../interfaces/databaseConnectionConfig";
import {JSONQuery} from "../interfaces/JSONQuery";
import {CacheEngineInterface} from "../interfaces/CacheEngineInterface";

export abstract class GenericEngine {
	// All abstract methods are mentioned here
	protected abstract prepareQuery(query: string, variables: Array<string>): string;
	protected abstract runQuery(query: string): Q.Promise<any>;

	// The implemented part of the class is here
	protected cacheEngine: CacheEngineInterface;

	public constructor(engine: CacheEngineInterface) {
		this.cacheEngine = engine;
	}

	protected createCacheItemIdentifier(identifier: string, variables: Array<string>): string {
		let identifierName: string = identifier;

		for(let i = 0; i < variables.length; i++) {
			identifierName = identifierName + "_" + variables[i];
		}

		return identifierName;
	}

	protected readQueryFile(queryFile: string): Q.Promise<any> {
		let deferred = Q.defer<any>();

		// check if the query file exists
		fs.open(queryFile, "r", function(err, fd) {
			if(err) {
				deferred.reject(err);
			} else {
				fs.readFile(queryFile, {encoding: 'utf-8'}, function(err, query) {
					if(err) {
						deferred.reject(err);
					} else {
						// check if we got a valid query json file
						try {
							let queryJSON: JSONQuery = JSON.parse(query);

							deferred.resolve(queryJSON);
						} catch(err) {
							deferred.reject('ERROR: Could not parse query JSON file. Error = '+err);
						};

					}
				});
			}
		});

		return deferred.promise;
	}

	protected preQuery(jsonQuery: JSONQuery, cacheItemIdentifier: string): Q.Promise<any> {
		let deferred = Q.defer<any>();

		switch(jsonQuery.cache.pre) {
			case "check":
				this.cacheEngine.get(cacheItemIdentifier)
					.then((rows: any) => {
						deferred.notify("Got " + cacheItemIdentifier + " in the cache");

						// Resolve the promise with the cached rows
						deferred.resolve(rows);
					}, (err: any) => {
						if(err !== null) {
							deferred.notify(err);
						} else {
							deferred.notify("Could not find " + cacheItemIdentifier + " in the cache to get.");
						}

						// Resolve the promise as no critical error has occurred
						deferred.resolve(null);
					});
				break;
			case "uncache":
				this.cacheEngine.unset(cacheItemIdentifier)
					.then(() => {
						deferred.notify("Unset " + cacheItemIdentifier + " from the cache");

						// Resolve the promise as the item was unset
						deferred.resolve(null);
					}, (err) => {
						if(err !== null) {
							// This is an error
							deferred.notify(err);
						} else {
							// null indicates a cache miss
							deferred.notify("Could not find " + cacheItemIdentifier + " in the cache to unset.");
						}

						// Resolve the promise as no critical error has occurred
						deferred.resolve(null);
					});
				break;
			default:
				deferred.resolve(null);
				break;
		}

		return deferred.promise;
	}

	public query(queryFile: string, variables: Array<string>): Q.Promise<any> {
		let deferred = Q.defer<any>();

		// Read the query first
		this.readQueryFile(queryFile).then(
			(jsonQuery: JSONQuery) => {
				// Lets get the cache item identifier
				let cacheItemIdentifier = this.createCacheItemIdentifier(
					jsonQuery.name,
					variables
				);

				// Check if we have to run anything pre-query
				if(jsonQuery.cache && jsonQuery.cache.pre) {
					this.preQuery(jsonQuery, cacheItemIdentifier)
						.then((rows) => {
							// Check if there was data returned
							if(rows !== null) {
								// Data was returned so pre work is done
								deferred.resolve(rows);

								if(jsonQuery.cache && jsonQuery.cache.post) {
									// The post section will run since we found some data
									this.postQuery(jsonQuery, cacheItemIdentifier, rows)
										.progress((progress: any) => {
											// Pass all progress events down the chain
											deferred.notify(progress);
										});
								}
							} else {
								// Cache was unset or not found or operation not supported
								// Either way, lets run the queryJSON
								// Now that we know the query was read, format the queryJSON
								let fullyFormedQuery: string = this.prepareQuery(
									jsonQuery.query,
									variables
								);

								this.runQuery(fullyFormedQuery)
									.then((rows: any) => {
										// Return the data
										deferred.notify("Fetched rows from database for "+cacheItemIdentifier);
										deferred.resolve(rows);

										if(jsonQuery.cache && jsonQuery.cache.post) {
											// The post section will only run if the query was a success
											this.postQuery(jsonQuery, cacheItemIdentifier, rows)
												.progress((progress: any) => {
													// Pass all progress events down the chain
													deferred.notify(progress);
												});
										}
									}, (err: any) => {
										deferred.notify(err);
										deferred.reject(null);
									}, (progress: any) => {
										// Pass all progress events down the chain
										deferred.notify(progress);
									});
							}
						}, (err: any) => {
							// This should not be called since preQuery() is not
							// calling deferred.reject at any point
						}, (progress: any) => {
							// Pass all progress events down the chain
							deferred.notify(progress);
						})
				} else {
					// There was no pre-section
					// Format the queryJSON
					let fullyFormedQuery: string = this.prepareQuery(
						jsonQuery.query,
						variables
					);

					this.runQuery(fullyFormedQuery)
						.then((rows: any) => {
							// Return the data
							deferred.notify("Fetched rows from database for "+cacheItemIdentifier);
							deferred.resolve(rows);

							if(jsonQuery.cache && jsonQuery.cache.post) {
								// The post section will only run if the query was a success
								this.postQuery(jsonQuery, cacheItemIdentifier, rows)
									.progress((progress: any) => {
										// Pass all progress events down the chain
										deferred.notify(progress);
									});
							}
						}, (err: any) => {
							deferred.notify(err);
							deferred.reject(null);
						}, (progress: any) => {
							// Pass all progress events down the chain
							deferred.notify(progress);
						});
				}
			}, (err) => {
				deferred.reject(err);
			}
		)

		return deferred.promise;
	}

	protected postQuery(jsonQuery: JSONQuery, cacheItemIdentifier: string, rows: any): Q.Promise<any> {
		let deferred = Q.defer<any>();

		switch(jsonQuery.cache.post) {
			case "uncache":
				this.cacheEngine.unset(cacheItemIdentifier)
					.then(() => {
						deferred.notify("Unset " + cacheItemIdentifier + " from the cache");

						// Resolve the promise as the item was unset
						deferred.resolve(null);
					}, (err) => {
						if(err !== null) {
							// This is an error
							deferred.notify(err);
						} else {
							// null indicates a cache miss
							deferred.notify("Could not find " + cacheItemIdentifier + " in the cache to unset.");
						}

						// Resolve the promise as no critical error has occurred
						deferred.resolve(null);
					});
				break;
				case "cache":
					this.cacheEngine.set(cacheItemIdentifier, rows)
						.then(() => {
							deferred.notify("Set " + cacheItemIdentifier + " in the cache");

							// Resolve the promise as the item was unset
							deferred.resolve(null);
						}, (err) => {
							if(err !== false) {
								// This is an error
								deferred.notify(err);
							} else {
								// false indicates a cache set failure
								deferred.notify("Could not set " + cacheItemIdentifier + " in the cache.");
							}

							// Resolve the promise as no critical error has occurred
							deferred.resolve(null);
						});
					break;
			default:
				deferred.resolve(null);
				break;
		}

		return deferred.promise;
	}
}
