export interface UtmEntity<RequestType, BackendFormattingParams = never> {
	// Formatters
	displayName: string;
	asBackendFormat(params: BackendFormattingParams): RequestType;
	asPrintableEntries(): { property: string; value: string }[];
}
