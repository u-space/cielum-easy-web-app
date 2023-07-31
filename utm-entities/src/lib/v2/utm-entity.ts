export interface UtmEntity<RequestType, BackendFormattingParams = never> {
	displayName(): string;
	asBackendFormat(params: BackendFormattingParams): RequestType;
}
