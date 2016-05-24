/// <reference path="../typings/node.d.ts"/>
/// <reference path="../typings/q.d.ts"/>

import * as globalConfig from "../config";
import {DatabaseConnectionConfig, EngineInterface} from "../interfaces/databaseConnectionConfig";
import {GenericEngine} from "./genericEngine";

import * as Q from "q";

var mysql = require("mysql");

export class MySQLEngine extends GenericEngine {
	private pool: any;

	constructor(connectionConfig: DatabaseConnectionConfig, connectionLimit: number = globalConfig.connectionLimit) {
		super();

		// Lets create the connection pool
		this.pool  = mysql.createPool({
		  connectionLimit : connectionLimit,
		  host: connectionConfig.host,
		  user: connectionConfig.username,
		  password: connectionConfig.password,
		  database: connectionConfig.database
		});
	}

	private prepareQuery(query: string, variables: Array<string>): string {
		return mysql.format(query, variables);
	}

	// Run a query on the database
	public query(
		query: string,
		cacheIdentifier?: string,
		variables?: Array<string>
	): Q.Promise<any> {
		var deferred = Q.defer<any>();

		this.pool.getConnection((err, connection) => {
		  // If err is set, there was an issue getting the pool
		  if(err) {
			  deferred.reject(err);
		  } else {
			  let preparedQuery: string = this.prepareQuery(query, variables);

			  // Use the connection
			  connection.query(preparedQuery, (connection_err, rows) => {
				  // Return the conenction to the pool as we are done with it
  			    connection.release();

				  if(connection_err) {
					  deferred.reject(err);
				  } else {
					  deferred.resolve(rows);
				  }
			  });
		  }
		});

		return deferred.promise;
	}
}
