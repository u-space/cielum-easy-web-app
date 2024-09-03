import type { MapViewState } from '@deck.gl/core/typed';
import type { Geometry } from 'geojson';
import { useEffect, useState } from 'react';
import { get, writable } from 'svelte/store';
import { BackgroundMode, DestroyHandler, UpdateHandler, type FlyToPosition } from './types';
import { getNewViewport } from './util';

const initialPosition = {
	latitude: -34.89712784173059,
	longitude: -56.163996853234295,
	zoom: 15
};

export interface TokyoStore {
	//editMode: string;
	viewState: MapViewState | null;
	flyToPosition: FlyToPosition;
}

const defaultBackgroundMode = BackgroundMode.Streets;
//const defaultEditMode = EditMode.DISABLED;
const defaultViewState = null;
const defaultFlyToPosition = initialPosition;

// Svelte-land
export const tokyoViewState = writable<MapViewState | null>(defaultViewState); //Do not edit this directly, use the flyTo method instead
export const tokyoFlyToPosition = writable<FlyToPosition>(defaultFlyToPosition);

// Having this as a store allows us to have multiple components listening to it
// and not having to explicitly listen to events when calling these components
// which becomes quickly quite verbose
export const tokyoInternalsUpdateHandler = writable<UpdateHandler | null>();
export const tokyoInternalsDestroyHandler = writable<DestroyHandler | null>();

// React-land
export function flyToCenterOfGeometry(geometry: Geometry, zoom?: number) {
	const viewState = get(tokyoViewState) as MapViewState;
	const viewport = getNewViewport(geometry, viewState);
	tokyoFlyToPosition.set({
		latitude: viewport?.latitude || 0,
		longitude: viewport?.longitude || 0,
		zoom: zoom || viewport?.zoom || 15
	});
}

export const useTokyo = () => {
	const [currentTokyoStore, setTokyoStore] = useState<TokyoStore>({
		//editMode: defaultEditMode,
		viewState: defaultViewState,
		flyToPosition: defaultFlyToPosition
	});

	useEffect(() => {
		const unsub3 = tokyoViewState.subscribe((value) =>
			setTokyoStore((store) => ({ ...store, viewState: value }))
		);
		const unsub4 = tokyoFlyToPosition.subscribe((value) =>
			setTokyoStore((store) => ({ ...store, flyToPosition: value }))
		);
		return () => {
			unsub3();
			unsub4();
		};
	}, []);

	return {
		state: currentTokyoStore,
		flyTo: (longitude: number, latitude: number, zoom?: number) => {
			tokyoFlyToPosition.set({ longitude, latitude, zoom: zoom || 15 });
		},
		flyToCenterOfGeometry: (geometry: Geometry, zoom?: number) => {
			flyToCenterOfGeometry(geometry, zoom);
		}
	};
};
