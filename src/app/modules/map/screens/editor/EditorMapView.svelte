<svelte:options immutable={true}/>

<script lang="ts">
	import Tokyo from '@tokyo/Tokyo.svelte';
	import {GeographicalZoneDrawingProps, geographicalZoneTokyoConverter} from '@tokyo/converters/fra/geographicalZone';
	import TokyoGenericMapElement from '@tokyo/TokyoGenericMapElement.svelte';
	import {EditorMapViewProps} from "./EditorMapViewProps";

	export let editOptions: EditorMapViewProps['editOptions'];
	export let geographicalZones: EditorMapViewProps['geographicalZones'];

	const alphas: GeographicalZoneDrawingProps = {
		lineAlpha: 255,
		fillAlpha: 15,
		threeDimensional: false,
	};
</script>

<Tokyo
		editOptions={editOptions}
		mapOptions={{ isPickEnabled: false }}
		on:edit
		on:select
		on:pick
>
	{#each geographicalZones as geographicalZone (geographicalZone.id)}
		<TokyoGenericMapElement
				id={geographicalZoneTokyoConverter.getId(geographicalZone)}
				getLayer={geographicalZoneTokyoConverter.getConverter(geographicalZone, alphas)}
		/>
	{/each}
</Tokyo>

