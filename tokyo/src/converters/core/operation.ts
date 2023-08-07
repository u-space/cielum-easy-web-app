import type { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { ClipExtension } from '@deck.gl/extensions/typed';
import { getPickableId, PickableType } from '../../util';
import _ from 'lodash';
import {
	GZ_FILL_COLOR,
	GZ_LINE_COLOR,
	OPERATION_STATE_COLORS,
	SELECTED_GZ_FILL_COLOR,
	SELECTED_OPERATION_FILL_COLOR,
	SELECTED_OPERATION_LINE_COLOR,
	SELECTED_OPERATION_VOLUME_LINE_COLOR
} from '../../TokyoDefaults';
import type { ConvertToLayer, RGBA, RGBnumber } from '../../types';
import type { OperationEntity } from '@utm-entities/operation';
import { GeoJsonLayer } from '@deck.gl/layers/typed';
import type { BaseOperation } from '@utm-entities/v2/model/operation';

export interface OperationDrawingProps {
	fillAlpha?: RGBnumber; // 0-255
	lineAlpha?: RGBnumber; // 0-255
	selected?: { gufi: string; volume: number };
}

export const operationTokyoConverter: ConvertToLayer<BaseOperation, OperationDrawingProps> = {
	getId: getIdFromOperation,
	getConverter: getConverterFromOperation
};

function getIdFromOperation(operation: BaseOperation) {
	return getPickableId(PickableType.Operation, operation.gufi || '', operation.name || '');
}

function getConverterFromOperation(_operation: BaseOperation, options?: OperationDrawingProps) {
	const operation = _.cloneDeep(_operation);
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
		if (options?.selected && options.selected.gufi === operation.gufi) {
			return SELECTED_OPERATION_FILL_COLOR;
		} else {
			return fillColor;
		}
	};

	return () =>
		new GeoJsonLayer({
			// TODO: Could use loaders.gl format to speed-up loading
			data: operation.operation_volumes.map((volume, index) => ({
				type: 'Feature',
				geometry: volume.operation_geography
			})),
			id,
			filled: true,
			pickable: true,
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
