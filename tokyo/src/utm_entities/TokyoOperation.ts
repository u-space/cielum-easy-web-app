// Class that given an Operation returns a TokyoPolygon
import type { OperationEntity } from '@utm-entities/operation';
import type { Polygon } from 'geojson';
import { TokyoMultiPolygon } from '../shapes/2d/TokyoMultiPolygon';
import type { RGBA } from '../TokyoTypes';
import {
	DEFAULT_LINE_COLOR,
	OPERATION_STATE_COLORS,
	SELECTED_OPERATION_LINE_COLOR,
	SELECTED_OPERATION_VOLUME_LINE_COLOR
} from '../TokyoDefaults';
import { convertMultipleGeoJsonPolygonsIntoAGeoJsonMultiPolygon } from '../internal/TokyoUtil';
import type { OperationVolume } from '@utm-entities/operation';

const convertOperationVolumesIntoPolygons = (operation: OperationEntity): Polygon[] => {
	return operation.operation_volumes.map((volume: OperationVolume) => {
		return volume.operation_geography;
	});
};

export class TokyoOperation extends TokyoMultiPolygon {
	constructor(operation: OperationEntity, isSelected = false, idVolume = -1) {
		const polygons = convertOperationVolumesIntoPolygons(operation);
		const multipolygon = convertMultipleGeoJsonPolygonsIntoAGeoJsonMultiPolygon(polygons);
		const stateColor = OPERATION_STATE_COLORS[operation.state];
		const fill: RGBA = [stateColor[0], stateColor[1], stateColor[2], 50];
		const getLineColor = (index?: number) => {
			if (isSelected) {
				return index === Number(idVolume)
					? (SELECTED_OPERATION_VOLUME_LINE_COLOR as RGBA)
					: (SELECTED_OPERATION_LINE_COLOR as RGBA);
			} else {
				return DEFAULT_LINE_COLOR as RGBA;
			}
		};

		super(multipolygon, `operation|${operation.gufi}|${operation.name}`, fill, getLineColor);
	}
}
