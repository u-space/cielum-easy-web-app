import _ from 'lodash';
import { TokyoGeographicalZone } from '@tokyo/utm_entities/TokyoGeographicalZone';
import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { TokyoFlightRequest } from '@tokyo/utm_entities/TokyoFlightRequest';
import { FlightRequestEntity } from '@flight-request-entities/flightRequest';

export function renderGeographicalZones(
	geographicalZones: GeographicalZone[],
	idGeographicalZone: string | null,
	picked: string[],
	onHover?: TokyoGeographicalZone['onHover']
) {
	if (geographicalZones) {
		const items = _.cloneDeep(geographicalZones);
		return items.flatMap((gz) => {
			if (!onHover) {
				return new TokyoGeographicalZone(gz, gz.id === idGeographicalZone);
			} else {
				const isInPickedList =
					(picked.length > 0 && gz.id && picked.includes(gz.id)) || picked.length === 0;
				if (isInPickedList) {
					return new TokyoGeographicalZone(gz, gz.id === idGeographicalZone, onHover);
				} else {
					return [];
				}
			}
		});
	} else {
		return [];
	}
}

export function renderFlightRequests(flightRequests: FlightRequestEntity[], idSelected: string) {
	if (flightRequests) {
		return _.cloneDeep(
			// TODO: Stop cloning deep when we stop using observables
			flightRequests.map((fr) => {
				return new TokyoFlightRequest(fr, fr.id === idSelected);
			})
		);
	} else {
		return [];
	}
}
