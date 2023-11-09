import type { PositionEntity } from '@utm-entities/position';
import type { ConvertToLayer } from '../../../types';
import { calculateLocationWithElevationMultiplier } from '../../util';
import { PathLayer } from '@deck.gl/layers/typed';
import { getPickableId, PickableType } from '../../../util';

type VehiclePositionTailTokyoConverter = ConvertToLayer<PositionEntity[], undefined>;
const getConverterFromPositions: VehiclePositionTailTokyoConverter['getConverter'] = (
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
	return getPickableId(
		PickableType.Vehicle,
		positions[0].gufi + positions[0].uvin,
		positions[0].displayName
	);
};

export const vehiclePositionTailTokyoConverter: VehiclePositionTailTokyoConverter = {
	getId: getIdFromPositions,
	getConverter: getConverterFromPositions
};
