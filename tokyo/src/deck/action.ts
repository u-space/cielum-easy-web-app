import type { PickingInfo } from '@deck.gl/core/typed';
import {
	Deck,
	FlyToInterpolator,
	type Layer,
	MapView,
	type MapViewState
} from '@deck.gl/core/typed';
import { get, writable } from 'svelte/store';
import {
	getPolygonFeatureCollectionEditable,
	getSatelliteLayer,
	getStreetsLayer
} from './default_layers';
import { tokyoViewState } from '../store';
import type { DeckActionParams, FlyToPosition } from '../types';
import { BackgroundMode, EditMode } from '../types';
import { logDebug } from '../logger';
import { getOnClickHandler } from './click';

const mapView = new MapView({
	id: 'base-map',
	repeat: true,
	controller: { scrollZoom: { smooth: true, speed: 0.025 } }
});

/* Helpers */
function calculateViewState(position: FlyToPosition) {
	const { latitude, longitude, zoom, duration } = position;
	return {
		// We add microscopic noise to the position to force a fly even if the position is the same
		latitude: Math.random() * 0.0000001 + latitude,
		longitude: Math.random() * 0.0000001 + longitude,
		zoom: zoom,
		bearing: 0,
		pitch: 0,
		maxPitch: 0,
		minPitch: 0,
		//minZoom: 10,
		transitionDuration: duration ?? 500,
		transitionInterpolator: new FlyToInterpolator()
	};
}

/* Deck instantiation logic */

function getBaseLayers(params: DeckActionParams): Layer[] {
	const baseLayers: Layer[] =
		params.mapParams.backgroundMode === BackgroundMode.Streets
			? [getStreetsLayer()]
			: [getSatelliteLayer()];
	return baseLayers;
}

function getEditLayers(params: DeckActionParams): Layer[] {
	const editLayers: Layer[] = [];
	if (params.editParams.mode !== EditMode.DISABLED) {
		editLayers.push(getPolygonFeatureCollectionEditable(params.editParams) as Layer);
	}
	return editLayers;
}

/* Deck state keeping logic */
const lastPositionUpdate = writable<FlyToPosition | null>(null);
export const isDeckMounted = writable<boolean>(false);

export function deckAction(node: HTMLCanvasElement, params: DeckActionParams) {
	const lastViewState = localStorage.getItem('Tokyo_v3_ViewState');
	const initialViewState = calculateViewState(params.position);

	const deck = new Deck({
		canvas: node,
		initialViewState: lastViewState ? JSON.parse(lastViewState) : initialViewState,
		onViewStateChange: ({ viewState: newViewState }) => {
			console.log('onViewStateChange', newViewState);
			localStorage.setItem('Tokyo_v3_ViewState', JSON.stringify(newViewState));
			tokyoViewState.set(newViewState as MapViewState);
		},
		layers: getBaseLayers(params),
		views: mapView
	});

	lastPositionUpdate.set(params.position);
	isDeckMounted.set(true);

	return {
		destroy: () => {
			deck.finalize();
			isDeckMounted.set(false);
			lastPositionUpdate.set(null);
			tokyoViewState.set(null);
			return null;
		},
		update: (params: DeckActionParams) => {
			logDebug('UPDATE', params);
			const newProps = {
				layers: [...getBaseLayers(params), ...params.layers, ...getEditLayers(params)],
				onClick: getOnClickHandler({ deck, params, onClick: () => false }),
				onHover: (info: PickingInfo) =>
					node.dispatchEvent(new CustomEvent('hover', { detail: info.layer }))
			};
			if (get(lastPositionUpdate) !== params.position) {
				lastPositionUpdate.set(params.position);
				deck.setProps({
					...newProps,
					initialViewState: calculateViewState(params.position)
				});
			} else {
				deck.setProps(newProps);
			}
		}
	};
}
