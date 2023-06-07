import { TokyoPolygon } from '../shapes/2d/TokyoPolygon';
import { GZ_FILL_COLOR, GZ_LINE_COLOR, SELECTED_GZ_FILL_COLOR } from '../TokyoDefaults';
import type { GeographicalZone } from '@flight-request-entities/geographicalZone';

export class TokyoGeographicalZone extends TokyoPolygon {
	constructor(geographicalZone: GeographicalZone, isSelected = false) {
		super({
			polygon: geographicalZone.geography,
			id: `geographical-zone|${geographicalZone.id}|${geographicalZone.name}`,
			fill: isSelected ? SELECTED_GZ_FILL_COLOR : GZ_FILL_COLOR,
			getLineColor: () => GZ_LINE_COLOR
		});
	}
}
