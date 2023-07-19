import type { ConvertToLayer } from '../types';
import { IconLayer } from '@deck.gl/layers/typed';
import vehiclePositionMarker from '../../img/vehicle_position.png';
import type { PositionEntity } from '@utm-entities/position';
import { getPickableId, PickableType } from '@tokyo/util';
import { LineLayer } from '@deck.gl/layers/typed';
import _ from 'lodash';
import { TokyoLines } from '@tokyo/shapes/2d/TokyoLines';
import { ACTIVE_DRONE_LINE_COLOR, INACTIVE_DRONE_MARKER_COLOR } from '@tokyo/TokyoDefaults';

type VehiclePositionHeadTokyoConverter = ConvertToLayer<PositionEntity, undefined>;

const ICON_MAPPING = {
	vehicle: {
		x: 0,
		y: 0,
		width: 96,
		height: 96,
		mask: false
	}
};

const getConverterFromPosition: VehiclePositionHeadTokyoConverter['getConverter'] =
	(position: PositionEntity) => () => {
		return new IconLayer({
			id: getIdFromPosition(position),
			data: [position],
			pickable: true,
			iconAtlas: vehiclePositionMarker,
			iconMapping: ICON_MAPPING,
			getIcon: (d) => 'vehicle',
			getSize: 36,
			getAngle: -position.heading,
			getPosition: (d) => [d.location.coordinates[0], d.location.coordinates[1]]
		});
	};
export const vehiclePositionHeadTokyoConverter: VehiclePositionHeadTokyoConverter = {
	getId: getIdFromPosition,
	getConverter: getConverterFromPosition
};

function getIdFromPosition(position: PositionEntity) {
	return getPickableId(PickableType.Vehicle, position.gufi, position.displayName);
}

// Tail converter
// TODO: Make this as a composite layer in deckgl
type VehiclePositionTailTokyoConverter = ConvertToLayer<PositionEntity[], undefined>;

const getConverterFromPositions: VehiclePositionTailTokyoConverter['getConverter'] = (
	positions: PositionEntity[]
) => {
	const colorMultiplier = 1 / positions.length;
	const data = _.reduce(
		positions.slice(1),
		(acc, pos) => [
			...acc,
			{
				from: acc[acc.length - 1].to,
				to: pos.location,
				colorMultiplier: acc[acc.length - 1].colorMultiplier + colorMultiplier
			}
		],
		[
			{
				from: positions[0].location,
				to: positions[1].location,
				colorMultiplier: 0
			}
		]
	);
	return () =>
		new LineLayer({
			id: getIdFromPositions(positions) + '-tail',
			data,
			pickable: false,
			getWidth: 5,
			getSourcePosition: (d) => d.from.coordinates,
			getTargetPosition: (d) => d.to.coordinates,
			getColor: (d) => {
				// Interpolate between the two colors
				const from = ACTIVE_DRONE_LINE_COLOR;
				const to = INACTIVE_DRONE_MARKER_COLOR;
				const t = colorMultiplier ?? 0.5;
				const r = from[0] * (1 - t) + to[0] * t;
				const g = from[1] * (1 - t) + to[1] * t;
				const b = from[2] * (1 - t) + to[2] * t;
				return [r, g, b, to[3]];
			}
		});
};

const getIdFromPositions = (positions: PositionEntity[]) => {
	return getPickableId(PickableType.Vehicle, positions[0].gufi, positions[0].displayName);
};

export const vehiclePositionTailTokyoConverter: VehiclePositionTailTokyoConverter = {
	getId: getIdFromPositions,
	getConverter: getConverterFromPositions
};
