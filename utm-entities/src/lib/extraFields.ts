import { string } from 'joi';
import { DocumentEntity } from './document';

export interface ExtraFieldSchemas {
	users: ExtraFieldSchema;
	vehicles: ExtraFieldSchema;
	documents: ExtraFieldSchema;
}
export interface SchemaItem {
	// TODO: Move this type to the entity schema when its created
	type: SchemaItemType;
	required: boolean;
	docType?: string;
	onlyVisibleForAdmin?: boolean;
}

export type ExtraFieldSchema = { [key: string]: SchemaItem };

export enum SchemaItemType {
	String = 'String',
	Number = 'Number',
	Date = 'Date',
	File = 'File',
	Bool = 'Bool'
}

export type ExtraFields = {
	[key: string]: string | number | Date | File | boolean | DocumentEntity[];
};
