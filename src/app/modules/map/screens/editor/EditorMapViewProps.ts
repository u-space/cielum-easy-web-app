import { FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { EditOptions } from '@tokyo/types';

export interface EditorMapViewProps {
	geographicalZones: GeographicalZone[];
	flightRequests: FlightRequestEntity[];
	editOptions: EditOptions;
}
