/// <reference path="../typings/q.d.ts"/>

import {SmartCachier} from "../SmartCachier";
import {Notifier} from "../Notifier";

let config = {
    sqlEngine: {
        engine: "mysql",
        auth: {
            host: "localhost",
            username: "root",
            password: "qwertyuiop",
            database: "myint",
            connectionPoolLimit: 10
        },
    },
    cacheEngine: {
        engine: "memcached",
        host: "localhost:11211"
    }
}

let querier = new SmartCachier(config);

querier.query("queries/users/login.json", ["fabian.enos@gmail.com"])
    .then((rows) => {
        console.log(JSON.stringify(rows));
    }, (err) => {
        console.log("SMART CACHIER ERROR: "+err);
    })
