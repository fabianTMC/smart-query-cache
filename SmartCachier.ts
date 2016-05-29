import {SmartCachierConfig, SmartCachierCacheConfig} from "./interfaces/SmartCachierConfig";

// Import the notifier to keep track of what is going on
import {Notifier} from "./Notifier";

// Import all supported cacheEngines engines
import {CacheEngineInterface} from "./interfaces/CacheEngineInterface";
import {MemcachedCacheEngine} from "./engines/cacheEngines/memcached";

// Import all supported SQL engines
import {GenericEngine} from "./engines/genericEngine";
import {MySQLEngine} from "./engines/mysql";

export class SmartCachier {
    private config: SmartCachierConfig;
    private cacheConfig: SmartCachierCacheConfig;
    private connection: GenericEngine;
    private cacheEngine: CacheEngineInterface;

    // Constructor for the class
    constructor(config: SmartCachierConfig, cacheConfig: SmartCachierCacheConfig, notifier?: Notifier) {
        this.config = config;
        this.cacheConfig = cacheConfig;

        switch(this.cacheConfig.engine.toLowerCase()) {
            case "memcached":
                this.cacheEngine = new MemcachedCacheEngine(this.cacheConfig.host);
                break;
        }

        // Check if a cache engine was instantiated
        if(this.cacheEngine) {
            switch(this.config.engine.toLowerCase()) {
                case "mysql":
                    this.connection = new MySQLEngine(
                        this.config.auth,
                        this.cacheEngine,
                        notifier
                    );
                    break;
            }
        } else {
            throw new Error("Unsupported cache engine");
        }
    }

    public query(queryFile: string, variables: Array<string>): Q.Promise<any> {
        return this.connection.query(queryFile, variables);
    }
}
