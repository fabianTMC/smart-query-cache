export interface JSONQuery {
	name: string,
	query: string,
	cache?: {
		pre?: string,
		post?: string
	}
}
