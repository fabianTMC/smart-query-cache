/// <reference path="./typings/q.d.ts"/>

import {DatabaseConnectionConfig, EngineInterface} from "./interfaces/databaseConnectionConfig";
import {MySQLEngine} from "./engines/mysql";

import * as Q from "q";

interface SmartCachierConfig {
  engine: string;
  auth: DatabaseConnectionConfig
}

class SmartCachier {
    private config: SmartCachierConfig;
    private connection: EngineInterface;

    // Constructor for the class
    constructor(config: SmartCachierConfig) {
        this.config = config;

        switch(this.config.engine.toLowerCase()) {
            case "mysql":
                this.connection = new MySQLEngine(
                    this.config.auth,
                    10
                );
                break;
        }
    }

    public query(query: string, cacheIdentifier?: string, variables?: Array<string>): Q.Promise<any> {
        return this.connection.query(query, cacheIdentifier, variables);
    }
}

let mysqlConfig = {
    engine: "mysql",
    auth: {
        host: "localhost",
        username: "root",
        password: "qwertyuiop",
        database: "myint"
    }
}

let querier = new SmartCachier(mysqlConfig);
querier.query("SELECT * FROM users WHERE email = ?", "Fabian", ["fabian.enos@gmail.com"])
    .then(function(rows) {
        console.log(JSON.stringify(rows));
    }, function(err) {
        console.log("ERROR: "+err);
    })
