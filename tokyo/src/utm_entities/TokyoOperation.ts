// Class that given an Operation returns a TokyoPolygon
import { Operation } from '@dronfies/microutm-entities/operation';
import { Polygon } from 'geojson';
import { TokyoMultiPolygon } from '../shapes/2d/TokyoMultiPolygon';
import { RGBA } from '../TokyoTypes';
import {
	DEFAULT_LINE_COLOR,
	OPERATION_STATE_COLORS,
	SELECTED_OPERATION_LINE_COLOR,
	SELECTED_OPERATION_VOLUME_LINE_COLOR
} from '../TokyoDefaults';
import { convertMultipleGeoJsonPolygonsIntoAGeoJsonMultiPolygon } from '../internal/TokyoUtil';

const convertOperationVolumesIntoPolygons = (operation: Operation): Polygon[] => {
	return operation.operation_volumes.map((volume: Operation['operation_volumes']) => {
		return volume.operation_geography;
	});
};

export class TokyoOperation extends TokyoMultiPolygon {
	constructor(operation: Operation, isSelected = false, idVolume = -1) {
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
