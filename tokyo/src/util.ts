import { bbox, center, polygon } from '@turf/turf';
import type { Geometry, Position } from 'geojson';
import { MapViewState, WebMercatorViewport } from '@deck.gl/core/typed';

export function getNewViewport(geometry: Geometry, currentViewState: MapViewState | null) {
	if ('coordinates' in geometry && currentViewState) {
		const viewport = new WebMercatorViewport(currentViewState);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const boundingBox = bbox(polygon(geometry.coordinates as Position[]));
		const nw: [number, number] = [boundingBox[0] - 0.025, boundingBox[1] - 0.025];
		const se: [number, number] = [boundingBox[2] + 0.025, boundingBox[3] + 0.025];
		return viewport.fitBounds([nw, se]);
	}
}

// Pickings
export enum PickableType {
	GeographicalZone = 'geographical-zone',
	Operation = 'operation',
	Vehicle = 'vehicle',
	Rfv = 'rfv'
}
export function getPickableId(type: PickableType, id: string, name: string) {
	return `${type}|${id}|${name}`;
}

// Responsiveness
export const isTouchDevice = 'ontouchstart' in document.documentElement;
