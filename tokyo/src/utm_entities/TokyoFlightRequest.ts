import { TokyoPolygon } from '../shapes/2d/TokyoPolygon';
import type { FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { FR_FILL_COLOR, FR_LINE_COLOR, FR_SELECTED_FILL_COLOR } from '../TokyoDefaults';
import type { Polygon } from 'geojson';

export class TokyoFlightRequest extends TokyoPolygon {
	constructor(flightRequest: FlightRequestEntity, isSelected = false) {
		if (!flightRequest.volumes || flightRequest.volumes.length === 0) {
			throw new Error('Flight request has no volumes');
		}
		super(
			flightRequest.volumes[0].operation_geography as Polygon,
			`flight-request|${flightRequest.id}|${flightRequest.flight_comments}`,
			isSelected ? FR_SELECTED_FILL_COLOR : FR_FILL_COLOR,
			() => FR_LINE_COLOR
		);
	}
}
