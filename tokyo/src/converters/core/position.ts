import type { ConvertToLayer } from '../types';
import type { PositionEntity } from '@utm-entities/position';
import { getPickableId, PickableType } from '@tokyo/util';
import { calculateLocationWithElevationMultiplier, ELEVATION_MULTIPLIER } from '../util';
import { IconLayer, PathLayer } from '@deck.gl/layers/typed';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers/typed';
import { ConeGeometry } from '@luma.gl/engine';
import vehiclePositionMarker from '../../img/vehicle_position.png';

type VehiclePositionHeadTokyoConverter = ConvertToLayer<PositionEntity, undefined>;

const getConverterFromPosition: VehiclePositionHeadTokyoConverter['getConverter'] =
	(position: PositionEntity) => () => {
		return new SimpleMeshLayer({
			id: getIdFromPosition(position),
			data: [position],
			pickable: true,
			mesh: new ConeGeometry({ radius: 100, height: 400 }),
			getColor: [0, 0, 0],
			parameters: {
				depthTest: false
			},
			getPosition: (d) => [
				d.location.coordinates[0],
				d.location.coordinates[1],
				position.altitude_gps * ELEVATION_MULTIPLIER
			],
			getOrientation: (d) => [0, -position.heading, 0]
		});
	};

export const vehiclePositionHeadTokyoConverter: VehiclePositionHeadTokyoConverter = {
	getId: getIdFromPosition,
	getConverter: getConverterFromPosition
};

function getIdFromPosition(position: PositionEntity) {
	return getPickableId(PickableType.Vehicle, position.gufi, position.displayName);
}

// HEAD PROJECTION

type VehiclePositionHeadProjectionTokyoConverter = ConvertToLayer<PositionEntity, undefined>;

const ICON_MAPPING = {
	vehicle: {
		x: 0,
		y: 0,
		width: 96,
		height: 96,
		mask: false
	}
};

const getProjectionConverterFromPosition: VehiclePositionHeadProjectionTokyoConverter['getConverter'] =
	(position: PositionEntity) => () => {
		return new IconLayer({
			id: getIdFromPosition(position) + '-projection',
			data: [position],
			pickable: true,
			billboard: false,
			iconAtlas: vehiclePositionMarker,
			iconMapping: ICON_MAPPING,
			parameters: {
				depthTest: false
			},
			getIcon: (d) => 'vehicle',
			getSize: 36,
			getAngle: -position.heading,
			getPosition: (d) => [d.location.coordinates[0], d.location.coordinates[1]]
		});
	};

export const vehiclePositionHeadProjectionTokyoConverter: VehiclePositionHeadProjectionTokyoConverter =
	{
		getId: getIdFromPosition,
		getConverter: getProjectionConverterFromPosition
	};

// TAIL
type VehiclePositionTailTokyoConverter = ConvertToLayer<PositionEntity[], undefined>;
const getConverterFromPositions: VehiclePositionHeadProjectionTokyoConverter['getConverter'] = (
	positions: PositionEntity[]
) => {
	const data = positions
		.reduce((acc, pos) => {
			const coordinates = calculateLocationWithElevationMultiplier([
				...pos.location.coordinates,
				pos.altitude_gps
			]);
			return [
				...acc,
				{ from: acc.length > 0 ? acc[acc.length - 1].to : null, to: coordinates }
			];
		}, [])
		.slice(1);

	let index = data.length - 1;
	return () =>
		new PathLayer({
			id: getIdFromPositions(positions) + '-tail',
			data,
			pickable: false,
			getWidth: 2,
			widthUnits: 'pixels',
			billboard: true,
			parameters: {
				depthTest: false
			},
			extruded: true,
			getPath: (d) => [...d.from, ...d.to],
			getColor: () => [0, 255 * ((data.length - index--) / data.length), 0, 255]
		});
};

const getIdFromPositions = (positions: PositionEntity[]) => {
	return getPickableId(PickableType.Vehicle, positions[0].gufi, positions[0].displayName);
};

export const vehiclePositionTailTokyoConverter: VehiclePositionTailTokyoConverter = {
	getId: getIdFromPositions,
	getConverter: getConverterFromPositions
};
