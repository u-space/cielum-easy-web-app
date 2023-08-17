import { getPickableId, PickableType } from '../../util';
import _ from 'lodash';
import {
	OPERATION_STATE_COLORS,
	SELECTED_OPERATION_LINE_COLOR,
	SELECTED_OPERATION_VOLUME_LINE_COLOR
} from '../../TokyoDefaults';
import type { ConvertToLayer, RGBA, RGBnumber } from '../../types';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import type { BaseOperation } from '@utm-entities/v2/model/operation';
import type { OperationVolume } from '@utm-entities/v2/model/operation_volume';
import { ELEVATION_MULTIPLIER } from '../util';
import type { Position } from 'geojson';
import GL from '@luma.gl/constants';

export interface OperationDrawingProps {
	fillAlpha?: RGBnumber; // 0-255
	lineAlpha?: RGBnumber; // 0-255
	selected?: { gufi: string; volume: number };
	t?: (key: string) => string;
}

export const operationTokyoConverter: ConvertToLayer<BaseOperation, OperationDrawingProps> = {
	getId: getIdFromOperation,
	getConverter: getConverterFromOperation
};

function getIdFromOperation(operation: BaseOperation) {
	return getPickableId(PickableType.Operation, operation.gufi || '', operation.name || '');
}

function getHTMLTooltip(
	t: (key: string) => string,
	operation: BaseOperation,
	volume: OperationVolume,
	index: number
) {
	let html = `<h1>${t('Operation')} "${operation.name}"</h1>`;
	html += `<h2>${t('Volume')} ${index + 1} / ${operation.operation_volumes.length}</h2>`;
	volume.asPrintableEntries().forEach((entry) => {
		html += `<p><span class="tooltip-property">${t(
			`glossary:volume.${entry.property}`
		)}: </span>${t(entry.value)}</p>`;
	});
	return html;
}

function getConverterFromOperation(_operation: BaseOperation, options?: OperationDrawingProps) {
	const operation = _.cloneDeep(_operation);

	operation.operation_volumes.forEach((volume) => {
		if (volume.operation_geography)
			volume.operation_geography.coordinates[0].forEach((coordinate) => {
				coordinate[2] = volume.min_altitude * ELEVATION_MULTIPLIER;
			});
	});

	const id = getIdFromOperation(operation);
	const fillAlpha = options?.fillAlpha ?? 100;
	const lineAlpha = options?.lineAlpha ?? 255;

	const fillColor: RGBA = [...OPERATION_STATE_COLORS[operation.state], fillAlpha];
	const lineColor: RGBA = [...OPERATION_STATE_COLORS[operation.state], lineAlpha];

	const getLineWidth = () => {
		if (options?.selected && options.selected.gufi === operation.gufi) {
			return 3;
		} else {
			return 1;
		}
	};

	const getFillColor = () => {
		// Commented out 09/08/2023 as an urgent request appeared to make screenshots on our latest stable version
		// visual changes were requested to this screen as a result of that call
		// even if this is definitely out of scope of the change
		//if (options?.selected && options.selected.gufi === operation.gufi) {
		//	return SELECTED_OPERATION_FILL_COLOR;
		//} else {
		return fillColor;
		//}
	};

	return () =>
		new GeoJsonLayer({
			// TODO: Could use loaders.gl format to speed-up loading
			data: operation.operation_volumes.map((volume, index) => {
				return {
					type: 'Feature',
					geometry: volume.operation_geography,
					properties: {
						max_altitude: volume.max_altitude,
						min_altitude: volume.min_altitude,
						volume,
						operation,
						tooltip: options?.t
							? getHTMLTooltip(options.t, operation, volume, index)
							: undefined
					}
				};
			}),
			id,
			//getElevation: (polygon) =>
			//	polygon.properties?.volume.max_altitude * ELEVATION_MULTIPLIER,
			getElevation: (polygon) =>
				polygon.properties?.volume.max_altitude * ELEVATION_MULTIPLIER,
			pickable: true,
			wireframe: true,
			extruded: true,
			getFillColor,
			getLineWidth,
			lineWidthUnits: 'pixels',

			getLineColor: (object, info) => {
				if (options?.selected && options.selected.gufi === operation.gufi) {
					if (info.index === options.selected.volume) {
						return SELECTED_OPERATION_VOLUME_LINE_COLOR;
					} else {
						return SELECTED_OPERATION_LINE_COLOR;
					}
				} else {
					return lineColor;
				}
			}
			/*extruded: true, TODO: 3D mode
        getElevation: 50*/
		});
}
