export interface CacheEngineInterface {
	get(cacheIdentifier: string): Q.Promise<any>;
	set(cacheIdentifier: string, data:any): Q.Promise<any>;
	unset(cacheIdentifier: string): Q.Promise<any>;
	flush(): Q.Promise<any>;
}
