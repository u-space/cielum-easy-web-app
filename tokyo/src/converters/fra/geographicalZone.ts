import type { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { ClipExtension } from '@deck.gl/extensions/typed';

import { getPickableId, PickableType } from '../../util';
import _ from 'lodash';
import { GZ_FILL_COLOR, GZ_LINE_COLOR, SELECTED_GZ_FILL_COLOR } from '../../TokyoDefaults';
import type { ConvertToLayer, RGBA, RGBnumber } from '../../types';
import { PolygonLayer } from '@deck.gl/layers/typed';

export interface GeographicalZoneDrawingProps {
	fillAlpha: RGBnumber; // 0-255
	lineAlpha: RGBnumber; // 0-255
	threeDimensional: boolean;
}
export const geographicalZoneTokyoConverter: ConvertToLayer<
	GeographicalZone,
	GeographicalZoneDrawingProps
> = {
	getId: getIdFromGeographicalZone,
	getConverter: getConverterFromGeographicalZone
};

function getIdFromGeographicalZone(geographicalZone: GeographicalZone) {
	return getPickableId(
		PickableType.GeographicalZone,
		geographicalZone.id || '',
		geographicalZone.name
	);
}

// class PolygonTextLayer extends CompositeLayer {

const formatAltitude = (altitude: number) => {
	if (altitude === 0) {
		return 'GND'
	}
	else {
		return `${altitude} m AGL`
	}
};

function getConverterFromGeographicalZone(
	_geographicalZone: GeographicalZone,
	options?: GeographicalZoneDrawingProps
) {
	const geographicalZone = _.cloneDeep(_geographicalZone);
	const id = getIdFromGeographicalZone(geographicalZone);
	const fillAlpha = options?.fillAlpha ?? 50;
	const threeDimensional = options?.threeDimensional ?? true;

	const tooltipConent = `${formatAltitude(geographicalZone.max_altitude)}<hr />${formatAltitude(geographicalZone.min_altitude)}`;
	// geographicalZone.tooltip = tooltipConent;

	let fillColor: RGBA = [GZ_FILL_COLOR[0], GZ_FILL_COLOR[1], GZ_FILL_COLOR[2], fillAlpha];
	// if (false) {
	// 	fillColor = SELECTED_GZ_FILL_COLOR;
	// } else
	if (geographicalZone.name.startsWith('CTR')) {
		fillColor = [33, 156, 217, fillAlpha];
	} else if (geographicalZone.name.startsWith('HELIPUERTO')) {
		fillColor = [217, 125, 33, fillAlpha];
	}
	const lineColor: RGBA = [
		GZ_LINE_COLOR[0],
		GZ_LINE_COLOR[1],
		GZ_LINE_COLOR[2],
		options?.lineAlpha ?? GZ_LINE_COLOR[3]
	];

	return () =>
		new PolygonLayer({
			pickable: true,
			id,
			data: [
				{
					...geographicalZone.geography,
					properties: { ...geographicalZone, tooltip: tooltipConent }
				}
			],
			getPolygon: (d) => d.coordinates,
			getFillColor: fillColor,
			getLineColor: lineColor,
			lineWidthUnits: 'pixels',
			getLineWidth: 1,
			filled: true,
			extruded: false,

			parameters: {
				depthMask: false
			},
			getElevation: 0
		});
}
