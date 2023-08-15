export interface UtmEntity<RequestType, BackendFormattingParams = never> {
	// Formatters
	displayName: string;
	asBackendFormat(params: BackendFormattingParams): RequestType;
}

export interface UtmResponseEntity {
	displayName: string;
	asPrintableEntries(): { property: string; value: string }[];
}

export interface UtmRequestEntity<RequestType> {
	asBackendFormat: RequestType;
}
