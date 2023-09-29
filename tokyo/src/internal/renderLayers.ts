import { PathStyleExtension } from '@deck.gl/extensions/typed';
import { TileLayer } from '@deck.gl/geo-layers/typed';
import { BitmapLayer } from '@deck.gl/layers/typed';
import { Feature, Polygon } from 'geojson';
import { DrawPolygonMode, EditableGeoJsonLayer, ModifyMode, ViewMode } from 'nebula.gl';
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
import { MapEditMode, TokyoMapElement, TokyoViewMode } from '../types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { TokyoInternalState } from '../Tokyo.svelte';

function renderPolygonFeatureCollectionEditable(
	mode: MapEditMode,
	selectedPolygon: number | null,
	onInternalEdit: (polygons: Polygon[]) => void,
	onSelectPolygon: (polygon: number | null) => void,
	polygons?: Polygon[],
	isSinglePolygon?: boolean
) {
	const isAPolygonSelected =
		selectedPolygon !== null || (isSinglePolygon && polygons && polygons.length === 1);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return new (EditableGeoJsonLayer as any)({
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
			mode === MapEditMode.PAUSED
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
				if (mode === MapEditMode.EDITING) {
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
		state.edit.mode !== MapEditMode.INACTIVE
			? renderPolygonFeatureCollectionEditable(
					state.edit.mode,
					state.edit.selected,
					state.edit.edit,
					state.edit.onSelect,
					state.edit.polygons,
					state.edit.single
			  )
			: null
	];
	state.deck.setProps({ layers });
}
