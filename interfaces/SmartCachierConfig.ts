import {DatabaseConnectionConfig} from "./databaseConnectionConfig";

export interface SmartCachierConfig {
    sqlEngine: {
        engine: string,
        auth: DatabaseConnectionConfig,
    },
    cacheEngine: {
        engine: string,
        host: string
    }
}
