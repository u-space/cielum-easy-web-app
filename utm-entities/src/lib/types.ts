import { DocumentEntity } from './document';

export interface UpdateEntityParams<T> {
	entity: T;
	documents: Map<string, DocumentEntity>;
	isCreating: boolean;
}

export interface EntityHasDisplayName {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
	get displayName(): string;
}
