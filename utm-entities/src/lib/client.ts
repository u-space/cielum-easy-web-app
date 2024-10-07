import { getUserAPIClient, UserEntity } from './user';
import { getVehicleAPIClient, VehicleEntity } from './vehicle';
import { ExtraFieldSchemas } from './extraFields';
import { getOperationAPIClient as getOperationAPIClientV2 } from './v2/api/operation';
import { getRfvAPIClient } from './rfv';
import { getUvrAPIClient } from './uvr';
import { DocumentEntity, DocumentEntityType, getDocumentAPIClient } from './document';
import { getPositionAPIClient } from './position';
import { getRegularFlightAPIClient } from './regularFlight';
import { getAircraftTypeAPIClient } from './aircraftType';
import { getTrackerAPIClient } from './tracker';

export function getUTMClient(api: string, schemas: ExtraFieldSchemas, token: string | null) {
	const userAPIClient = getUserAPIClient(api, token, schemas.users);
	const vehicleAPIClient = getVehicleAPIClient(api, token, schemas.vehicles);
	const operationAPIClient = getOperationAPIClientV2(api, token);
	const rfvAPIClient = getRfvAPIClient(api, token);
	const uvrAPIClient = getUvrAPIClient(api, token);
	const documentAPIClient = getDocumentAPIClient(api, token);
	const positionAPIClient = getPositionAPIClient(api, token);
	const regularFlightAPIClient = getRegularFlightAPIClient(api, token);
	const aircraftTypeAPIClient = getAircraftTypeAPIClient(api, token);
	const trackerAPIClient = getTrackerAPIClient(api, token);
	return {
		user: userAPIClient,
		vehicle: vehicleAPIClient,
		operation: operationAPIClient,
		rfv: rfvAPIClient,
		uvr: uvrAPIClient,
		document: documentAPIClient,
		position: positionAPIClient,
		regularFlight: regularFlightAPIClient,
		aircraftType: aircraftTypeAPIClient,
		tracker: trackerAPIClient,
		multi: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			async saveUserAndDocuments(
				user: UserEntity,
				isAdmin: boolean,
				documents: Map<string, DocumentEntity>,
				isCreating: boolean
			) {
				let result = userAPIClient.saveUser(user, isAdmin, isCreating);
				if (documents) {
					result = result.then(async (response) => {
						for await (const document of Array.from(documents.values())) {
							await documentAPIClient.saveDocument(
								DocumentEntityType.USER,
								user.username.length > 0 ? user.username : user.email,
								document
							);
						}
						return response.data;
					});
				}
				return result;
			},
			async saveVehicleAndDocuments(
				vehicle: VehicleEntity,
				documents: Map<string, DocumentEntity>,
				isPilot: boolean,
				isCreating = false
			) {
				const documentList = Array.from(documents.values());
				const documentsSchemas = schemas.vehicleDocument
				const documentsSchemaKeys = Object.keys(documentsSchemas);
				const reuiredSchemnaDocuments = documentsSchemaKeys.filter(key => (documentsSchemas[key] as any)["__metadata"]["required"])
				const requieredAusentDocuments = reuiredSchemnaDocuments.filter(key => documentList.findIndex(d => d.tag === key) === -1)

				// console.log(`documentsSchemas: ${JSON.stringify(reuiredSchemnaDocuments, null, 2)}`);
				// console.log(`Documents: ${JSON.stringify(documentList, null, 2)}`);
				// console.log(`++Ausent documents++ ${JSON.stringify(requieredAusentDocuments, null, 2)}`);

				if (requieredAusentDocuments.length > 0) {
					throw requieredAusentDocuments.map(key => `${key} is required, but no value was supplied`)
					// throw new Error(`The following documents are required: ${requieredAusentDocuments.join(', ')}`)
				}

				let result = vehicleAPIClient.saveVehicle(vehicle, isPilot, isCreating);
				if (documents) {
					result = result.then(async (response) => {
						for await (const document of Array.from(documents.values())) {
							await documentAPIClient.saveDocument(
								DocumentEntityType.VEHICLE,
								response.data.uvin,
								document
							);
						}
						return response.data;
					});
				}
				return result;
			}
		}
	};
}
