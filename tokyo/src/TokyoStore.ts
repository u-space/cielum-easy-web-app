import { derived, get, writable } from 'svelte/store';
import { useCallback, useEffect, useState } from 'react';
import { Geometry } from 'geojson';
import turf from 'turf';
import { FlyToInterpolator, MapViewState, WebMercatorViewport } from '@deck.gl/core/typed';
import _ from 'lodash';

// General
export const deck = writable(null);

interface TokyoProps {
	flyTo: (lng: number, lat: number, zoom?: number) => void;
	flyToCenterOfGeometry: (geometry: Geometry) => void;
}

function calculateViewStateToGoTo(lng: number, lat: number, zoom: number) {
	return {
		initialViewState: {
			latitude: lat + Math.random() * 0.00001,
			longitude: lng + Math.random() * 0.00001,
			zoom: zoom,
			bearing: 0,
			pitch: 0,
			maxPitch: 0,
			minPitch: 0,
			//minZoom: 10,
			transitionDuration: 500,
			transitionInterpolator: new FlyToInterpolator()
		}
	};
}

// Svelte-land
export const viewMode = writable('streets');
export const editMode = writable('INACTIVE');
export const viewState = writable<MapViewState | null>(null);

export const tokyo = derived(deck, ($deck: any) => ({
	flyTo: (lng: number, lat: number, zoom = 15) => {
		if ($deck) $deck.setProps(calculateViewStateToGoTo(lng, lat, zoom));
	},
	flyToCenterOfGeometry: (geometry: Geometry) => {
		if ($deck) {
			/* if ('coordinates' in geometry) {
				const center = turf.center(turf.polygon(geometry.coordinates as any) as any);
				const [lng, lat] = center.geometry.coordinates;
				$deck.setProps(calculateViewStateToGoTo(lng, lat, 10));
			} */
			if ('coordinates' in geometry) {
				const currentViewState = get(viewState);
				const viewport = new WebMercatorViewport(currentViewState as any);
				const boundingBox = turf.bbox(turf.polygon(geometry.coordinates as any) as any);
				const nw: [number, number] = [boundingBox[0] - 0.025, boundingBox[1] - 0.025];
				const se: [number, number] = [boundingBox[2] + 0.025, boundingBox[3] + 0.025];
				const newViewport = viewport.fitBounds([nw, se]);
				$deck.setProps({
					initialViewState: {
						...viewState,
						...newViewport
					}
				});
			}
		}
	}
}));

// React-land
export const useTokyo = () => {
	const [currentTokyo, setCurrentTokyo] = useState<TokyoProps>({
		flyTo: () => {
			console.error('Trying to access Tokyo too early');
		},
		flyToCenterOfGeometry: () => {
			console.error('Trying to access Tokyo too early');
		}
	});
	const [currentViewMode, setCurrentViewMode] = useState<string>('');
	const [currentViewState, setCurrentViewState] = useState<MapViewState | null>(null);
	const setCurrentViewStateThrottled = useCallback(
		_.throttle(setCurrentViewState, 100, { leading: true, trailing: false }),
		[]
	);
	const [currentEditMode, setCurrentEditMode] = useState<string>('INACTIVE');

	useEffect(() => {
		const unsub = tokyo.subscribe((value) => setCurrentTokyo(value));
		const unsub2 = viewMode.subscribe((value) => setCurrentViewMode(value));
		const unsub3 = viewState.subscribe((value) => setCurrentViewStateThrottled(value));
		const unsub4 = editMode.subscribe((value) => setCurrentEditMode(value));
		return () => {
			unsub();
			unsub2();
			unsub3();
			unsub4();
		};
	}, []);

	return {
		...currentTokyo,
		viewMode: currentViewMode,
		viewState: currentViewState,
		editMode: currentEditMode
	};
};
