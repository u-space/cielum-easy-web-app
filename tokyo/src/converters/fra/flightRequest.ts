import { PolygonLayer } from '@deck.gl/layers/typed';
import type { FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { FR_FILL_COLOR, FR_LINE_COLOR } from '../../TokyoDefaults';
import type { ConvertToLayer, RGBA, RGBnumber } from '../../types';
import { getPickableId, PickableType } from '../../util';

export interface FlightRequestDrawingProps {
	fillAlpha: RGBnumber; // 0-255
	lineAlpha: RGBnumber; // 0-255
	threeDimensional: boolean;
}
export const flightRequestTokyoConverter: ConvertToLayer<
	FlightRequestEntity,
	FlightRequestDrawingProps
> = {
	getId: getIdFromFlightRequest,
	getConverter: getConverterFromFlightRequest
};

function getIdFromFlightRequest(flightRequest: FlightRequestEntity) {
	return getPickableId(PickableType.GeographicalZone, flightRequest.id || '', flightRequest.name);
}

function getConverterFromFlightRequest(
	flightRequest: FlightRequestEntity,
	options?: FlightRequestDrawingProps
) {
	const id = getIdFromFlightRequest(flightRequest);
	const fillAlpha = options?.fillAlpha ?? 150;
	const threeDimensional = options?.threeDimensional ?? true;

	const fillColor: RGBA = [FR_FILL_COLOR[0], FR_FILL_COLOR[1], FR_FILL_COLOR[2], fillAlpha];
	const lineColor: RGBA = [
		FR_LINE_COLOR[0],
		FR_LINE_COLOR[1],
		FR_LINE_COLOR[2],
		options?.lineAlpha ?? FR_LINE_COLOR[3]
	];

	return () =>
		new PolygonLayer({
			pickable: true,
			id,
			data: [flightRequest.volumes[0].operation_geography],
			getPolygon: (d) => d.coordinates,
			getFillColor: fillColor,
			getLineColor: lineColor,
			lineWidthUnits: 'pixels',
			getLineWidth: 1,
			filled: true,
			extruded: threeDimensional,
			parameters: {
				depthMask: false
			},
			getElevation: flightRequest.volumes[0].max_altitude
		});
}
