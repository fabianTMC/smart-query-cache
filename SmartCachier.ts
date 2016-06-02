import {SmartCachierConfig} from "./interfaces/SmartCachierConfig";

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

    private connection: GenericEngine;
    private cacheConnection: CacheEngineInterface;

    // Constructor for the class
    constructor(config: SmartCachierConfig, notifier?: Notifier) {
        this.config = config;

        // Which cache engine do we instantiate?
        switch(this.config.cacheEngine.engine.toLowerCase()) {
            case "memcached":
                this.cacheConnection = new MemcachedCacheEngine(this.config.cacheEngine.host);
                break;
            default:
                throw new Error("Unsupported cache engine");
        }

        // Which SQL engine do we instantiate?
        switch(this.config.sqlEngine.engine.toLowerCase()) {
            case "mysql":
                this.connection = new MySQLEngine(
                    this.config.sqlEngine.auth,
                    this.cacheConnection,
                    notifier
                );
                break;
            default:
                throw new Error("Unsupported sql engine");
        }
    }

    public query(queryFile: string, variables: Array<string>): Q.Promise<any> {
        return this.connection.query(queryFile, variables);
    }

    public flush(): Q.Promise<any> {
        return this.cacheConnection.flush();
    }
}
