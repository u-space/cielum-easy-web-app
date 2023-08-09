export interface UtmEntity<RequestType, BackendFormattingParams = never> {
	// Formatters
	displayName: string;
	asBackendFormat(params: BackendFormattingParams): RequestType;
}
