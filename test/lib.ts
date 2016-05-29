/// <reference path="../typings/q.d.ts"/>

import {SmartCachier} from "../SmartCachier";
import {Notifier} from "../Notifier";

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

let querier = new SmartCachier(
    mysqlConfig,
    cacheConfig,
    new Notifier(
        (message: string) => {
            console.log("NOTIFY: " + message);
        }
    ));

querier.query("queries/users/login.json", ["fabian.enos@gmail.com"])
    .then((rows) => {
        console.log(JSON.stringify(rows));
    }, (err) => {
        console.log("SMART CACHIER ERROR: "+err);
    })
