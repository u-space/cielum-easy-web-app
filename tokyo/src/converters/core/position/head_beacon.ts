import type { PositionEntity } from '@utm-entities/position';
import { SphereGeometry } from '@luma.gl/engine';
import { ELEVATION_MULTIPLIER } from '../../util';
import type { ConvertToLayer } from '../../../types';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers/typed';
import { getPickableId, PickableType } from '../../../util';

export interface VehiclePositionHeadDrawingProps {
	t: (key: string) => string;
}

type VehiclePositionHeadTokyoConverter = ConvertToLayer<
	PositionEntity,
	VehiclePositionHeadDrawingProps
>;

function getHTMLTooltip(t: (key: string) => string, position: PositionEntity) {
	let html = `<h1>${position.uvin}</h1>`; // TODO: Add vehicle name
	// html += `<h2>${t('Volume')} ${index + 1} / ${operation.operation_volumes.length}</h2>`;
	[
		{ property: 'time_sent', value: new Date(position.time_sent).toLocaleTimeString() },
		{ property: 'heading', value: position.heading.toString() },
		{ property: 'altitude_gps', value: position.altitude_gps.toString() }
	].forEach((entry) => {
		html += `<p><span class="tooltip-property">${t(
			`glossary:positions.${entry.property}`
		)}: </span>${t(entry.value)}</p>`;
	});
	return html;
}
const getConverterFromPosition: VehiclePositionHeadTokyoConverter['getConverter'] =
	(position: PositionEntity, options: VehiclePositionHeadDrawingProps) => () => {
		return new SimpleMeshLayer({
			id: getIdFromPosition(position),
			data: [
				{
					position: position,
					properties: {
						tooltip: options?.t ? getHTMLTooltip(options.t, position) : undefined
					}
				}
			],
			pickable: true,
			mesh: new SphereGeometry({ radius: 5 }),
			getColor: [0, 150, 0],
			parameters: {
				depthTest: false
			},
			getPosition: (d) => [
				d.position.location.coordinates[0],
				d.position.location.coordinates[1],
				position.altitude_gps * ELEVATION_MULTIPLIER
			],
			getOrientation: (d) => [0, -position.heading, 0]
		});
	};

function getIdFromPosition(position: PositionEntity) {
	return getPickableId(PickableType.Vehicle, position.gufi, position.displayName);
}

export const vehiclePositionHeadTokyoConverter: VehiclePositionHeadTokyoConverter = {
	getId: getIdFromPosition,
	getConverter: getConverterFromPosition
};
