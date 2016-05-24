import {DatabaseConnectionConfig, EngineInterface} from "../interfaces/databaseConnectionConfig";

export abstract class GenericEngine implements EngineInterface {
	public abstract query(
		query: string,
		cacheIdentifier?: string,
		variables?: Array<string>
	): Q.Promise<any>;

	protected createCacheIdentifier(identifier: string, variables: Array<string>): string {
		let identifierName: string = identifier;
		let i: number;

		for(i = 0; i < variables.length; i++) {
			identifierName = identifierName + variables[i] + "_";
		}

		return (i > 0) ?
			identifierName.substring(0, identifierName.length-1) : identifierName;
	}
}
