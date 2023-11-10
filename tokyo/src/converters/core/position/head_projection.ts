import type { PositionEntity } from '@utm-entities/position';
import type { ConvertToLayer } from '../../../types';
import { IconLayer } from '@deck.gl/layers/typed';
import vehiclePositionMarker from '../../../img/vehicle_position.png';
import { getPickableId, PickableType } from '../../../util';

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

function getIdFromPosition(position: PositionEntity) {
	return (
		getPickableId(PickableType.Vehicle, position.gufi + position.uvin, position.displayName) +
		'-projection'
	);
}

export const vehiclePositionHeadProjectionTokyoConverter: VehiclePositionHeadProjectionTokyoConverter =
	{
		getId: getIdFromPosition,
		getConverter: getProjectionConverterFromPosition
	};
