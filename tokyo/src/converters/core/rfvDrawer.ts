import { PolygonLayer } from '@deck.gl/layers/typed';
import _ from 'lodash';
import type { ConvertToLayer, RGBA, RGBnumber } from '../../types';
import { getPickableId, PickableType } from '../../util';

import type { RfvEntity } from '@utm-entities/rfv';
import { ELEVATION_MULTIPLIER } from '../util';

export interface OperationDrawingProps {
	fillAlpha?: RGBnumber; // 0-255
	lineAlpha?: RGBnumber; // 0-255
	selected?: { gufi: string; volume: number };
	t?: (key: string) => string;
}

export const rfvTokyoConverter: ConvertToLayer<RfvEntity, OperationDrawingProps> = {
	getId: getIdFromRfv,
	getConverter: getConverterFromOperation
};

function getIdFromRfv(rfv: RfvEntity) {
	return getPickableId(PickableType.Rfv, rfv.id || '', rfv.comments || '');
}

function getConverterFromOperation(_rfv: RfvEntity, options?: OperationDrawingProps) {
	const rfv: RfvEntity = _.cloneDeep(_rfv);

	// No entiendo estas lineas, trato de adaptar
	// rfv.operation_volumes.forEach((volume) => {
	// 	if (volume.operation_geography)
	// 		volume.operation_geography.coordinates[0].forEach((coordinate) => {
	// 			coordinate[2] = volume.min_altitude * ELEVATION_MULTIPLIER;
	// 		});
	// });
	if (rfv.geography)
		rfv.geography.coordinates[0].forEach((coordinate) => {
			coordinate[2] = rfv.min_altitude * ELEVATION_MULTIPLIER;
		});

	const id = getIdFromRfv(rfv);
	const fillAlpha = options?.fillAlpha ?? 100;
	const lineAlpha = options?.lineAlpha ?? 255;

	const fillColor: RGBA = [255, 153, 51, fillAlpha];
	const lineColor: RGBA = [255, 153, 51, lineAlpha];

	const getLineWidth = () => {
		if (options?.selected && options.selected.gufi === rfv.gufi) {
			return 3;
		} else {
			return 1;
		}
	};

	return () =>
		new PolygonLayer({
			pickable: true,
			id,
			data: [{ ...rfv.geography, properties: rfv }],
			getPolygon: (d) => d.coordinates,
			getFillColor: fillColor,
			getLineColor: lineColor,
			lineWidthUnits: 'pixels',
			getLineWidth: 1,
			filled: true,
			extruded: true,
			parameters: {
				depthMask: false
			}
			//getElevation: 400
		});

	// return () =>
	// 	new GeoJsonLayer({
	// 		// TODO: Could use loaders.gl format to speed-up loading

	// 		// no me queda claro esto tampoco
	// 		// data: rfv.operation_volumes.map((volume, index) => {
	// 		// 	return {
	// 		// 		type: 'Feature',
	// 		// 		geometry: volume.operation_geography,
	// 		// 		properties: {
	// 		// 			max_altitude: volume.max_altitude,
	// 		// 			min_altitude: volume.min_altitude,
	// 		// 			volume,
	// 		// 			operation: rfv,
	// 		// 			tooltip: options?.t
	// 		// 				? getHTMLTooltip(options.t, rfv, volume, index)
	// 		// 				: undefined
	// 		// 		}
	// 		// 	};
	// 		// }),
	// 		// data: [rfv].map((rfv, index) => {
	// 		// 	return {
	// 		// 		type: 'Feature',
	// 		// 		geometry: rfv.geography,
	// 		// 		properties: {
	// 		// 			max_altitude: rfv.max_altitude,
	// 		// 			min_altitude: rfv.min_altitude,
	// 		// 			rfv,
	// 		// 			operation: rfv,
	// 		// 			tooltip: options?.t ? getHTMLTooltip(options.t, rfv, index) : undefined
	// 		// 		}
	// 		// 	};
	// 		// }),
	// 		id,
	// 		getElevation: (polygon) =>
	// 			polygon.properties?.volume.max_altitude * ELEVATION_MULTIPLIER,
	// 		pickable: true,
	// 		wireframe: true,
	// 		extruded: true,
	// 		getFillColor: RFV_FILL_COLOR,
	// 		getLineWidth: 3,
	// 		lineWidthUnits: 'pixels',
	// 		parameters: { depthMask: false },
	// 		getLineColor: RFV_LINE_COLOR
	// 	});
}
