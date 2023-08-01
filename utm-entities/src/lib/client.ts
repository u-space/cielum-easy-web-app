import { getUserAPIClient, UserEntity } from './user';
import { getVehicleAPIClient, VehicleEntity } from './vehicle';
import { ExtraFieldSchemas } from './extraFields';
import { getOperationAPIClient } from './operation';
import { getOperationAPIClient as getOperationAPIClientV2 } from './v2/api/operation';
import { getRfvAPIClient } from './rfv';
import { getUvrAPIClient } from './uvr';
import { DocumentEntity, DocumentEntityType, getDocumentAPIClient } from './document';
import { getPositionAPIClient } from './position';
import { getRegularFlightAPIClient } from './regularFlight';
import { getAircraftTypeAPIClient } from './aircraftType';
import { getTrackerAPIClient } from './tracker';

export function getUTMClient(api: string, schemas: ExtraFieldSchemas, token: string | null) {
	if (token) {
		const userAPIClient = getUserAPIClient(api, token, schemas.users);
		const vehicleAPIClient = getVehicleAPIClient(api, token, schemas.vehicles);
		const operationAPIClient = getOperationAPIClient(api, token);
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
					documents: Map<string, DocumentEntity>,
					isCreating: boolean
				) {
					let result = userAPIClient.saveUser(user, isCreating);
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
	} else {
		// TODO: Simplify this gigantic if as soon as more guest endpoints are added
		const operationAPIClient = getOperationAPIClientV2(api, null);
		return {
			operation: operationAPIClient
		};
	}
}
