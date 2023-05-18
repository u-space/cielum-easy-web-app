import { getGeographicalZoneAPIClient } from './geographicalZone';
import { getCoordinationAPIClient } from './coordination';
import { getCoordinatorAPIClient } from './coordinator';
import { getFlightRequestAPIClient } from './flightRequest';

export function getFlightRequestServiceAPIClient(api: string, token: string) {
	const geographicalZoneAPIClient = getGeographicalZoneAPIClient(api, token);
	const coordinationAPIClient = getCoordinationAPIClient(api, token);
	const coordinatorAPIClient = getCoordinatorAPIClient(api, token);
	const flightRequestAPIClient = getFlightRequestAPIClient(api, token);
	return {
		geographicalZone: geographicalZoneAPIClient,
		coordination: coordinationAPIClient,
		coordinator: coordinatorAPIClient,
		flightRequest: flightRequestAPIClient
	};
}
