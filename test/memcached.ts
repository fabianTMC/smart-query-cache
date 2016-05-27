/// <reference path="../typings/chai/chai.d.ts"/>
/// <reference path="../typings/chai-as-promised/chai-as-promised.d.ts"/>
/// <reference path="../typings/mocha/mocha.d.ts"/>
/// <reference path="../typings/node.d.ts"/>

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {MemcachedCacheEngine} from "../engines/cacheEngines/memcached";

// Enable chai to work with promises
chai.use(chaiAsPromised);

/* This test requires memcached to be installed and running at the time of
   running this test
*/
describe('MemcachedCacheEngine', () => {
    const engine: MemcachedCacheEngine = new MemcachedCacheEngine();

	const testCases: Array<any> = [
		{id: 1, name: "John Doe", email: "john@doe.com"},
		{id: 2, name: "Jane Doe", email: "jane@doe.com"},
	];

	it('should set item `test1`', () => {
        return chai.expect(engine.set("test1", testCases[0]))
            .to.eventually.equal(true);
	});

    it('should set item `test2`', () => {
        return chai.expect(engine.set("test2", testCases[1]))
            .to.eventually.equal(true);
	});

    it('should get the previously set `test1` item', () => {
        return chai.expect(engine.get("test1"))
            .to.eventually.deep.equal(testCases[0]);
	});

    it('should fail to get the unset item `test3`', () => {
        return chai.expect(engine.get("test3"))
            .to.be.rejected;
	});

    it('should unset item `test1`', () => {
        return chai.expect(engine.unset("test1"))
            .to.eventually.equal(true);
	});

    it('should fail to unset item `test1` as it is already unset', () => {
        return chai.expect(engine.unset("test1"))
            .to.be.rejected;
	});

    it('should flush the cache', () => {
        return chai.expect(engine.flush())
            .to.eventually.equal(true);
	});

    it('should fail to get the flushed item `test2`', () => {
        return chai.expect(engine.get("test2"))
            .to.be.rejected;
	});
});
