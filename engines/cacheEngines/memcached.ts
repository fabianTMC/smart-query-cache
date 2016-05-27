/// <reference path="../../typings/q.d.ts"/>

import * as Q from "q";
import {CacheEngineInterface} from "../../interfaces/CacheEngineInterface";

// API Reference: http://amitlevy.com/projects/memjs/
let memcached = require("memjs");

export class MemcachedCacheEngine implements CacheEngineInterface {
	private connection: any;

	constructor() {
		this.connection = memcached.Client.create();
	}

	public flush(): Q.Promise<any> {
		let deferred = Q.defer<any>();

		this.connection.flush((lastErr, results) => {
	        if(lastErr === null) {
	            deferred.resolve(true);
	        } else {
	            deferred.reject(results);
	        }
	    });

		return deferred.promise;
	}

	public unset(cacheIdentifier: string): Q.Promise<any> {
		let deferred = Q.defer<any>();

		this.connection.delete(cacheIdentifier, (err, success) => {
	        if(err) {
	            deferred.reject(err);
	        } else {
	            if(success) {
	                // REMOVAL HIT
	                deferred.resolve(true);
	            } else {
	                // REMOVAL MISS
	                deferred.reject(false);
	            }
	        }
	    });

		return deferred.promise;
	}

	public set(cacheIdentifier: string, data: any): Q.Promise<any> {
		let deferred = Q.defer<any>();

		this.connection.set(cacheIdentifier, JSON.stringify(data), (err, val) => {
	        if(err) {
	            deferred.reject(err);
	        } else {
	            if(val) {
	                // CACHE SUCCESS
	                deferred.resolve(true);
	            } else {
	                // CACHE ERROR
	                deferred.reject(false);
	            }
	        }
	    });

		return deferred.promise;
	}

	public get(cacheIdentifier: string): Q.Promise<any> {
		let deferred = Q.defer<any>();

		this.connection.get(cacheIdentifier, (err, val, flags) => {
	        if(err) {
	            deferred.reject(err);
	        } else {
	            // check if we got a value
	            if(val !== null) {
	                // CACHE HIT
	                deferred.resolve(JSON.parse(val))
	            } else {
	                // CACHE MISS
	                deferred.reject(null);
	            }
	        }
	    });

		return deferred.promise;
	}
}
