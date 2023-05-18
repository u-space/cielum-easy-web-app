import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { TokyoGeographicalZone } from '@tokyo/utm_entities/TokyoGeographicalZone';
import _ from 'lodash';

export function renderGeographicalZones(
	geographicalZones: GeographicalZone[],
	idGeographicalZone: string | null
) {
	if (geographicalZones) {
		const items = _.cloneDeep(geographicalZones);
		return items.map((gz) => {
			return new TokyoGeographicalZone(gz, gz.id === idGeographicalZone);
		});
	} else {
		return [];
	}
}
