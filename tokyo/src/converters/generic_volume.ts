import _ from 'lodash';
import type { ConvertToLayer, RGBA } from '../types';
import { PolygonLayer } from '@deck.gl/layers/typed';
import type { Polygon } from 'geojson';
import { ELEVATION_MULTIPLIER } from './util';

export interface GenericVolumeDrawingProps {
	fillColor: RGBA;
	lineColor: RGBA;
	threeDimensional: boolean;
}

export interface GenericVolume {
	id: string;
	polygon: Polygon;
	min_altitude: number;
	max_altitude: number;
}
export const genericVolumeTokyoConverter: ConvertToLayer<GenericVolume, GenericVolumeDrawingProps> =
	{
		getId: getIdFromGenericVolume,
		getConverter: getConverterFromGenericVolume
	};

function getIdFromGenericVolume(genericVolume: GenericVolume) {
	return genericVolume.id;
}

function getConverterFromGenericVolume(
	_volume: GenericVolume,
	options?: GenericVolumeDrawingProps
) {
	const volume = _.cloneDeep(_volume);
	const id = volume.id;
	const fillColor = options?.fillColor ?? [0, 0, 0, 100];
	const lineColor = options?.lineColor ?? [0, 0, 0, 255];
	const threeDimensional = options?.threeDimensional ?? true;

	if (options.threeDimensional) {
		volume.polygon.coordinates[0].forEach((coordinate) => {
			coordinate[2] = volume.min_altitude * ELEVATION_MULTIPLIER;
		});
	}

	return () =>
		new PolygonLayer({
			pickable: false,
			id,
			data: [volume.polygon],
			getPolygon: (d) => d.coordinates,
			getFillColor: fillColor,
			getLineColor: lineColor,
			lineWidthUnits: 'pixels',
			getLineWidth: 1,
			filled: true,
			extruded: threeDimensional,
			getElevation: volume.max_altitude * ELEVATION_MULTIPLIER
		});
}
