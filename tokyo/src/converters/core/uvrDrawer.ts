import { PolygonLayer } from '@deck.gl/layers/typed';
import _ from 'lodash';
import type { ConvertToLayer, RGBA, RGBnumber } from '../../types';
import { getPickableId, PickableType } from '../../util';
import i18n from 'i18next';


import { UvrType, type UvrEntity } from '@utm-entities/uvr';
import { ELEVATION_MULTIPLIER } from '../util';

export interface OperationDrawingProps {
	fillAlpha?: RGBnumber; // 0-255
	lineAlpha?: RGBnumber; // 0-255
	selected?: { gufi: string; volume: number };
	t?: (key: string) => string;
}

export const uvrTokyoConverter: ConvertToLayer<UvrEntity, OperationDrawingProps> = {
	getId: getIdFromUvr,
	getConverter: getConverterFromOperation
};

function getIdFromUvr(uvr: UvrEntity) {
	return getPickableId(
		PickableType.Uvr,
		uvr.message_id || '',
		`type:${uvr.type},cause:${uvr.cause},reason:${uvr.reason}` || ''
	);
}

function getTooltipContent(uvr: UvrEntity) {
	return `${uvr.effective_time_begin.toLocaleString()} </br > ${uvr.effective_time_end.toLocaleString()} </br > ${uvr.reason} </br > ${i18n.t(uvr.type)}`;
}

function getConverterFromOperation(_uvr: UvrEntity, options?: OperationDrawingProps) {
	const uvr: UvrEntity = _.cloneDeep(_uvr);

	if (uvr.geography)
		uvr.geography.coordinates[0].forEach((coordinate) => {
			coordinate[2] = uvr.min_altitude * ELEVATION_MULTIPLIER;
		});

	const id = getIdFromUvr(uvr);
	const fillAlpha = options?.fillAlpha ?? 100;
	const lineAlpha = options?.lineAlpha ?? 255;

	const fillColor: RGBA = [213, 82, 213, fillAlpha];
	const lineColor: RGBA = [137, 58, 136, lineAlpha];


	const fillColorRed: RGBA = [255, 77, 77, fillAlpha];
	const lineColorRed: RGBA = [255, 77, 77, lineAlpha];



	return () =>
		new PolygonLayer({
			pickable: true,
			id,
			data: [{ ...uvr.geography, properties: { ...uvr, tooltip: getTooltipContent(uvr) } }],
			getPolygon: (d) => d.coordinates,
			getFillColor: uvr.type == UvrType.DYNAMIC_RESTRICTION ? fillColorRed : fillColor,
			getLineColor: uvr.type == UvrType.DYNAMIC_RESTRICTION ? lineColorRed : lineColor,
			lineWidthUnits: 'pixels',
			getLineWidth: 1,
			filled: true,
			extruded: false,
			parameters: {
				depthMask: false
			},
			getElevation: (uvr) => {
				return uvr.properties.max_altitude * ELEVATION_MULTIPLIER;
			}
		});
}
