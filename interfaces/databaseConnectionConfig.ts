export interface DatabaseConnectionConfig {
    host: string,
    username: string,
    password: string,
    database: string
}

export interface EngineInterface {
    query(
        query: string,
        cacheIdentifier?: string,
        variables?: Array<string>
    ): Q.Promise<any>;
}
