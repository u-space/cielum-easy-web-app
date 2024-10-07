import Axios from 'axios';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import env from '../../../vendor/environment/env';
import { ExtraFieldSchemas } from '@utm-entities/extraFields';

export enum SchemaStatus {
	NOT_YET_STARTED_FETCHING = 'NOT_YET_STARTED_FETCHING',
	FETCHING = 'FETCHING',
	FETCHED = 'FETCHED'
}

const axios = Axios.create({
	baseURL: env.core_api,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json'
	}
});

interface SchemaState extends ExtraFieldSchemas {
	status: SchemaStatus;
	fetch: () => Promise<void>;
}

export const useSchemaStore = create<SchemaState>()(
	devtools(
		(set) => ({
			users: {},
			vehicles: {},
			documents: {},
			vehicleDocument: {},
			status: SchemaStatus.NOT_YET_STARTED_FETCHING,
			fetch: async () => {
				// TODO: Create entity schema, probably not in utm-entities
				set({ status: SchemaStatus.FETCHING });
				const response = await axios.get('/schemas');
				const schemas = response.data;
				set({
					users: schemas.userExtraFields,
					vehicles: schemas.vehicleExtraFields,
					documents: schemas.documentExtraFields,
					vehicleDocument: schemas.vehicleDocumentExtraFields,
					status: SchemaStatus.FETCHED
				});
			}
		}),
		{ name: 'SchemaStore' }
	)
);
