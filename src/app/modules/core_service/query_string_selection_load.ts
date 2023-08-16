import { PickableType } from '@tokyo/util';

interface Selected {
	type: PickableType;
	id: string;
	volume?: number;
}

export type QueryStringSelection = Selected | null;

export function getQueryStringSelection(): QueryStringSelection {
	// Loading of entity selection via query strings
	// This will only work if the query string is set before the component is loaded
	const params = new URLSearchParams(window.location.search);
	const idOperation = params.get('operation');
	const idGeographicalZone = params.get('geographical-zone');
	const idVolume: number | undefined = Number(params.get('volume')) ?? undefined;

	if (idOperation) {
		return { type: PickableType.Operation, id: idOperation, volume: idVolume };
	} else if (idGeographicalZone) {
		return { type: PickableType.GeographicalZone, id: idGeographicalZone };
	} else {
		return null;
	}
}
