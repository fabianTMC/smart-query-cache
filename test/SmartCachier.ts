/// <reference path="../typings/chai/chai.d.ts"/>
/// <reference path="../typings/chai-as-promised/chai-as-promised.d.ts"/>
/// <reference path="../typings/mocha/mocha.d.ts"/>
/// <reference path="../typings/node.d.ts"/>

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {SmartCachier} from "../SmartCachier";

// Enable chai to work with promises
chai.use(chaiAsPromised);

let mutableConfig = {
    sqlEngine: {
        engine: "mysql",
        auth: {
            host: "localhost",
            username: "mock",
            password: "mock",
            database: "mock",
            connectionPoolLimit: 10
        },
    },
    cacheEngine: {
        engine: "memcached",
        host: "localhost:11211"
    }
};

describe('SmartCachier', () => {
	it('should fail because of an unsupported cache engine', () => {
		// Change the mutable config to reflect an unsupported cache engine
		mutableConfig.cacheEngine.engine = "SomethingThatDoesntExist";

        return chai.expect(() => {
			new SmartCachier(mutableConfig)
		}).to.throw("Unsupported cache engine");
	});

	it('should fail because of an unsupported sql engine', () => {
		// Change the mutable config to reflect an unsupported cache engine
		mutableConfig.cacheEngine.engine = "memcached";
		mutableConfig.sqlEngine.engine = "SomethingThatDoesntExist";

        return chai.expect(() => {
			new SmartCachier(mutableConfig)
		}).to.throw("Unsupported sql engine");
	});

	it('should not fail because all are supported engines', () => {
		// Change the mutable config to reflect an unsupported cache engine
		mutableConfig.cacheEngine.engine = "memcached";
		mutableConfig.sqlEngine.engine = "mysql";

        return chai.expect(() => {
			new SmartCachier(mutableConfig)
		}).to.not.throw;
	});
});
