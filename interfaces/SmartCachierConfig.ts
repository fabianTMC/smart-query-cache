import {DatabaseConnectionConfig} from "./databaseConnectionConfig";

export interface SmartCachierConfig {
  engine: string,
  auth: DatabaseConnectionConfig,
}

export interface SmartCachierCacheConfig {
  engine: string,
  host: string
}
