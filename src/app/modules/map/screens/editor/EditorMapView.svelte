<svelte:options  immutable={true} />

<script lang="ts">
	import Tokyo from '@tokyo/Tokyo.svelte';
	import {renderGeographicalZones} from '../../render';
	import {onMount} from 'svelte';
	import {editMode} from '@tokyo/TokyoStore';
	import {TokyoEditMode} from '@tokyo/TokyoTypes';
	import {EditorMapViewProps} from './EditorMapViewProps';

	export let editingSingleVolume: EditorMapViewProps['editingSingleVolume'] = false
	export let handlers: EditorMapViewProps['handlers'] = {
		pick: () => {
		},
		edit: () => {
		},
		editingPolygonSelect: () => {
		},
	}
	export let defaultPolygons: EditorMapViewProps['defaultPolygons'] = [];
	export let geographicalZones: EditorMapViewProps['geographicalZones'] = [];

	$: geographicalZonesLayers = renderGeographicalZones(geographicalZones, null);

	$: elements = [...geographicalZonesLayers];

	onMount(() => {
		$editMode = TokyoEditMode.EDITING;
	});
</script>

<Tokyo
		{elements}
		onEdit={handlers.edit}
		{editingSingleVolume}
		onEditingPolygonSelect={handlers.editingPolygonSelect}
		{defaultPolygons}
		onPick={handlers.pick}
/>
