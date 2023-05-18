import { FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { TokyoPick } from '@tokyo/TokyoTypes';

export interface PlanningMapViewProps {
	flightRequests: FlightRequestEntity[];
	geographicalZones: GeographicalZone[];
	selected: {
		flightRequest: string | null;
	};
	handlers: {
		pick?: (elements: TokyoPick[]) => void;
	};
}
