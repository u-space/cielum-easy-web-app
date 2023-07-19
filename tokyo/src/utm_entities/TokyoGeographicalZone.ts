import { TokyoPolygon } from '../shapes/2d/TokyoPolygon';
import { GZ_FILL_COLOR, GZ_LINE_COLOR, SELECTED_GZ_FILL_COLOR } from '../TokyoDefaults';
import type { GeographicalZone } from '@flight-request-entities/geographicalZone';

export class TokyoGeographicalZone extends TokyoPolygon {
	constructor(
		geographicalZone: GeographicalZone,
		isSelected = false,
		onHover?: TokyoPolygon['onHover']
	) {
		let fillColor = GZ_FILL_COLOR;
		if (isSelected) {
			fillColor = SELECTED_GZ_FILL_COLOR;
		} else if (geographicalZone.name.startsWith('CTR')) {
			fillColor = [33, 156, 217, 50];
		} else if (geographicalZone.name.startsWith('HELIPUERTO')) {
			fillColor = [217, 125, 33, 50];
		}

		super({
			polygon: geographicalZone.geography,
			id: `geographical-zone|${geographicalZone.id}|${geographicalZone.name}`,
			fill: fillColor,
			getLineColor: () => GZ_LINE_COLOR,
			onHover
		});
	}
}
