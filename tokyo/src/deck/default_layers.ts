import { GeoBoundingBox, TileLayer } from '@deck.gl/geo-layers/typed';
import { BitmapLayer } from '@deck.gl/layers/typed';
import { EditMode, EditParams } from '../types';
import type { Feature, Polygon } from 'geojson';
import { DrawPolygonMode, EditableGeoJsonLayer, ModifyMode } from 'nebula.gl';
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
import { PathStyleExtension } from '@deck.gl/extensions/typed';
import { createEventDispatcher } from 'svelte';

const devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

export function getStreetsLayer() {
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
		pickable: false,
		// https://wiki.openstreetmap.org/wiki/Zoom_levels
		minZoom: 0,
		maxZoom: 19,
		tileSize: 256 / devicePixelRatio,
		renderSubLayers: (props) => {
			const tile = props.tile;

			const bbox = tile.bbox as GeoBoundingBox;
			const { west, south, east, north } = bbox;

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

export function getSatelliteLayer() {
	return new TileLayer({
		data: [
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
		],
		maxRequests: 10,
		pickable: false,
		minZoom: 0,
		maxZoom: 19,
		tileSize: 256,
		renderSubLayers: (props) => {
			const tile = props.tile;
			const bbox = tile.bbox as GeoBoundingBox;
			const { west, south, east, north } = bbox;

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

// Extracted onEdit of the props passed to EditableGeoJsonLayer
const onEditableLayerEdit = (params: EditParams) => (e) => {
	console.log('onEditableLayerEdit', e);

	if (
		e.editType === 'addFeature' ||
		e.editType === 'movePosition' ||
		e.editType === 'removePosition' ||
		e.editType === 'addPosition'
	) {
		params.handlers.edit(
			e.updatedData.features.map((feature: Feature<Polygon>) => feature.geometry)
		);
	}
	if (e.editType === 'addFeature' && params.mode === EditMode.SINGLE) params.handlers.select(0);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onEditableLayerClick = (params: EditParams) => (e: any) => {
	console.log('onEditableLayerClick', e);
	if (!e.isGuide && e.featureType === 'polygons') {
		if (params.mode !== EditMode.DISABLED) {
			params.handlers.select(e.index);
			// Mark event as handled, otherwise map will react to this onClick event
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
};

export function getPolygonFeatureCollectionEditable(params: EditParams) {
	const dispatch = createEventDispatcher();

	// The state of this layer is handled outside (by the component)
	const isAPolygonSelected =
		params.indexSelected !== null ||
		(params.mode === EditMode.SINGLE && params.polygons && params.polygons.length === 1);

	const features = params.polygons.map((polygon) => ({
		type: 'Feature',
		geometry: polygon,
		properties: {}
	}));

	return new EditableGeoJsonLayer({
		id: 'EditableGeoJsonLayer',
		data: {
			type: 'FeatureCollection',
			features
		},
		mode: isAPolygonSelected ? ModifyMode : DrawPolygonMode,
		selectedFeatureIndexes: isAPolygonSelected ? [params.indexSelected || 0] : [],
		onEdit: onEditableLayerEdit(params),
		onClick: onEditableLayerClick(params),
		getEditHandlePointOutlineColor: HANDLE_OUTLINE_COLOR,
		getFillColor: (_feature, isSelected: boolean) =>
			isSelected ? SELECTED_EDITABLE_FILL_COLOR : NON_SELECTED_EDITABLE_FILL_COLOR,
		getLineColor: (_feature, isSelected: boolean) =>
			isSelected ? SELECTED_EDITABLE_LINE_COLOR : NON_SELECTED_EDITABLE_LINE_COLOR,
		getEditHandlePointColor: (handle) => {
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
