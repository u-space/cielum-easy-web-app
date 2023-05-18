import { TokyoEditMode, TokyoMapElement, TokyoViewMode } from '../TokyoTypes';
import { DrawPolygonMode, EditableGeoJsonLayer, ModifyMode, ViewMode } from 'nebula.gl';
import { Feature, Polygon } from 'geojson';
import {
	EXISTING_HANDLE_FILL_COLOR,
	EXISTING_HANDLE_RADIUS,
	HANDLE_OUTLINE_COLOR,
	INTERMEDIATE_HANDLE_FILL_COLOR,
	INTERMEDIATE_HANDLE_RADIUS,
	NON_SELECTED_EDITABLE_FILL_COLOR,
	NON_SELECTED_EDITABLE_LINE_COLOR,
	SELECTED_EDITABLE_FILL_COLOR,
	SELECTED_EDITABLE_LINE_COLOR,
	TENTATIVE_FILL_COLOR,
	TENTATIVE_LINE_COLOR
} from '../TokyoDefaults';
import { TileLayer } from '@deck.gl/geo-layers/typed';
import { BitmapLayer } from '@deck.gl/layers/typed';
import { PathStyleExtension } from '@deck.gl/extensions/typed';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { TokyoInternalState } from '../Tokyo.svelte';

const devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

function renderSatelliteView(state: TokyoInternalState) {
	return new TileLayer({
		data: [
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
		],
		maxRequests: 10,
		pickable: true,
		minZoom: 0,
		maxZoom: 19,
		tileSize: 256,
		renderSubLayers: (props) => {
			const {
				bbox: { west, south, east, north }
			} = props.tile as any;

			return [
				new BitmapLayer(props, {
					data: null,
					image: props.data,
					bounds: [west, south, east, north],
					tintColor: [180, 180, 195]
				})
			];
		}
	});
}

function renderStreetsView(state: TokyoInternalState) {
	return new TileLayer({
		// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
		data: [
			'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
			'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
			'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
		],

		// Since these OSM tiles support HTTP/2, we can make many concurrent requests
		// and we aren't limited by the browser to a certain number per domain.
		maxRequests: 20,
		pickable: true,
		// https://wiki.openstreetmap.org/wiki/Zoom_levels
		minZoom: 0,
		maxZoom: 19,
		tileSize: 256 / devicePixelRatio,
		renderSubLayers: (props) => {
			const {
				bbox: { west, south, east, north }
			} = props.tile as any;

			return [
				new BitmapLayer(props, {
					data: null,
					image: props.data,
					bounds: [west, south, east, north],
					tintColor: [180, 180, 195]
				})
			];
		}
	});
}

function renderPolygonFeatureCollectionEditable(
	mode: TokyoEditMode,
	selectedPolygon: number | null,
	onInternalEdit: (polygons: Polygon[]) => void,
	onSelectPolygon: (polygon: number | null) => void,
	polygons?: Polygon[],
	isSinglePolygon?: boolean
) {
	const isAPolygonSelected =
		selectedPolygon !== null || (isSinglePolygon && polygons && polygons.length === 1);
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	console.log('renderPolygonFeatureCollectionEditable', polygons);
	return new EditableGeoJsonLayer({
		id: 'EditableGeoJsonLayer',
		data: {
			type: 'FeatureCollection',
			features: polygons
				? polygons.map((polygon) => ({
						type: 'Feature',
						geometry: polygon,
						properties: {}
				  }))
				: []
		},
		mode:
			mode === TokyoEditMode.PAUSED
				? ViewMode
				: isAPolygonSelected
				? ModifyMode
				: DrawPolygonMode,
		selectedFeatureIndexes: isAPolygonSelected ? [selectedPolygon || 0] : [],
		onEdit: (e: any) => {
			if (
				e.editType === 'addFeature' ||
				e.editType === 'movePosition' ||
				e.editType === 'removePosition' ||
				e.editType === 'addPosition'
			) {
				onInternalEdit(
					e.updatedData.features.map((feature: Feature<Polygon>) => feature.geometry)
				);
			}
			if (e.editType === 'addFeature' && isSinglePolygon) onSelectPolygon(0);
		},
		onClick: (e: any) => {
			if (!e.isGuide && e.featureType === 'polygons') {
				if (mode === TokyoEditMode.EDITING) {
					onSelectPolygon(e.index);
					// Mark event as handled, otherwise map will react to this onClick event
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},
		getEditHandlePointOutlineColor: HANDLE_OUTLINE_COLOR,
		getFillColor: (_feature: any, isSelected: boolean) =>
			isSelected ? SELECTED_EDITABLE_FILL_COLOR : NON_SELECTED_EDITABLE_FILL_COLOR,
		getLineColor: (_feature: any, isSelected: boolean) =>
			isSelected ? SELECTED_EDITABLE_LINE_COLOR : NON_SELECTED_EDITABLE_LINE_COLOR,
		getEditHandlePointColor: (handle: any) => {
			if (handle.properties.editHandleType === 'existing') {
				return EXISTING_HANDLE_FILL_COLOR;
			} else {
				return INTERMEDIATE_HANDLE_FILL_COLOR;
			}
		},
		getEditHandlePointRadius: (handle: any) => {
			if (handle.properties.editHandleType === 'existing') {
				return EXISTING_HANDLE_RADIUS;
			} else {
				return INTERMEDIATE_HANDLE_RADIUS;
			}
		},
		_subLayerProps: {
			geojson: {
				getColor: [255, 0, 255, 255]
			},
			guides: {
				getFillColor: TENTATIVE_FILL_COLOR,
				getLineColor: TENTATIVE_LINE_COLOR,
				getDashArray: [3, 2],
				dashJustified: true,
				dashGapPickable: true,
				extensions: [new PathStyleExtension({ dash: true })]
			}
		}
	});
}

export function renderLayers(state: TokyoInternalState) {
	if (!state.deck) return;
	const layers: any = [
		state.view.mode === TokyoViewMode.Streets ? renderStreetsView(state) : null,
		state.view.mode === TokyoViewMode.Satellite ? renderSatelliteView(state) : null,
		...state.view.elements.map((element: TokyoMapElement) => element.render),
		state.edit.mode !== TokyoEditMode.INACTIVE
			? renderPolygonFeatureCollectionEditable(
					state.edit.mode,
					state.edit.selected,
					state.edit.onEdit,
					state.edit.onSelect,
					state.edit.polygons,
					state.edit.single
			  )
			: null
	];
	state.deck.setProps({ layers });
}
