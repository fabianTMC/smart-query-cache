/// <reference path="../typings/q.d.ts"/>

import {SmartCachier} from "../SmartCachier";

import * as Q from "q";

let mysqlConfig = {
    engine: "mysql",
    auth: {
        host: "localhost",
        username: "root",
        password: "qwertyuiop",
        database: "myint",
        connectionPoolLimit: 10
    },
}

let cacheConfig = {
    engine: "memcached",
    host: "localhost:11211"
}

let querier = new SmartCachier(mysqlConfig, cacheConfig);
querier.query("queries/users/login.json", ["fabian.enos@gmail.com"])
    .then((rows) => {
        console.log(JSON.stringify(rows));
    }, (err) => {
        console.log("SMART CACHIER ERROR: "+err);
    }, (progress) => {
        console.log("PROGRESS: " + progress);
    })
