/// <reference path="../typings/node.d.ts"/>
/// <reference path="../typings/q.d.ts"/>

import * as globalConfig from "../config";
import {DatabaseConnectionConfig} from "../interfaces/databaseConnectionConfig";
import {GenericEngine} from "./genericEngine";
import {CacheEngineInterface} from "../interfaces/CacheEngineInterface";

import * as Q from "q";

let mysql = require("mysql");

export class MySQLEngine extends GenericEngine {
	private pool: any;

	constructor(connectionConfig: DatabaseConnectionConfig, cacheEngine: CacheEngineInterface) {
		super(cacheEngine);

		// Lets create the connection pool
		this.pool  = mysql.createPool({
		  connectionLimit : connectionConfig.connectionPoolLimit,
		  host: connectionConfig.host,
		  user: connectionConfig.username,
		  password: connectionConfig.password,
		  database: connectionConfig.database
		});
	}

	protected prepareQuery(query: string, variables: Array<string>): string {
		return mysql.format(query, variables);
	}

	// Run a query on the database
	protected runQuery(query: string): Q.Promise<any> {
		var deferred = Q.defer<any>();

		this.pool.getConnection((err, connection) => {
		  // If err is set, there was an issue getting the pool
		  if(err) {
			  deferred.reject(err);
		  } else {
			  // Use the connection
			  connection.query(query, (connection_err, rows) => {
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
