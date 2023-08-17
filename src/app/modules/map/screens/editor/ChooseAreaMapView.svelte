<svelte:options immutable={true}/>

<script lang="ts">
	import Tokyo from '@tokyo/Tokyo.svelte';
	import {GeographicalZoneDrawingProps, geographicalZoneTokyoConverter} from '@tokyo/converters/fra/geographicalZone';
	import TokyoGenericMapElement from '@tokyo/TokyoGenericMapElement.svelte';
	import {EditorMapViewProps} from "./EditorMapViewProps";
	import {EditMode} from '@tokyo/types';
	import {tokyoViewState} from '@tokyo/store';
	import {onMount} from 'svelte';
	import {WebMercatorViewport} from '@deck.gl/core/typed';
	import {GenericVolumeDrawingProps, genericVolumeTokyoConverter} from '@tokyo/converters/generic_volume';
	import env from '../../../../../vendor/environment/env';
	import CButton from '@tokyo/gui/CButton.svelte';


	let topLeft = [0, 0];
	let topRight = [0, 0];
	let bottomLeft = [0, 0];
	let bottomRight = [0, 0];

	const POLYGON_WIDTH = 400;
	const POLYGON_HEIGHT = 200;

	$: {
		if ($tokyoViewState) {
			const viewport = new WebMercatorViewport($tokyoViewState);
			const width = viewport.width;
			const height = viewport.height;
			const minX = Math.max((width - POLYGON_WIDTH) / 2, 0);
			const minY = Math.max((height - POLYGON_HEIGHT) / 2, 0);
			const maxX = Math.min((width + POLYGON_WIDTH) / 2, width);
			const maxY = Math.min((height + POLYGON_HEIGHT) / 2, height);
			topLeft = viewport.unproject([minX, minY]);
			topRight = viewport.unproject([maxX, minY]);
			bottomLeft = viewport.unproject([minX, maxY]);
			bottomRight = viewport.unproject([maxX, maxY]);
		}
	}

	$: volume = {
		id: 'choose-area-polygon',
		polygon: {
			type: 'Polygon',
			coordinates: [[
				[topLeft[0], topLeft[1]],
				[topRight[0], topRight[1]],
				[bottomRight[0], bottomRight[1]],
				[bottomLeft[0], bottomLeft[1]],
				[topLeft[0], topLeft[1]]
			]]
		},
		max_altitude: 0,
		min_altitude: 0,
	}

	export let geographicalZones: EditorMapViewProps['geographicalZones'];

	const geographicalZoneDrawingProps: GeographicalZoneDrawingProps = {
		lineAlpha: 255,
		fillAlpha: 200,
		threeDimensional: false
	};

	const volumeDrawingProps: GenericVolumeDrawingProps = {
		fillColor: [255, 0, 0, 100],
		lineColor: [255, 0, 0, 255],
		threeDimensional: false
	};
</script>

<Tokyo
		editOptions={{mode: EditMode.DISABLED}}
		mapOptions={{ isPickEnabled: false, is3D: false }}
		controlsOptions={{
			geocoder: {
				enabled: true,
				geoapifyApiKey: env.API_keys.geoapify,
			},
			geolocator: {
				enabled: true,
			},
			backgroundModeSwitch: {
				enabled: true
			},
			zoom: {
				enabled: true,
			}
		}}
>
	{#each geographicalZones as geographicalZone (geographicalZone.id)}
		<TokyoGenericMapElement
				id={geographicalZoneTokyoConverter.getId(geographicalZone)}
				getLayer={geographicalZoneTokyoConverter.getConverter(geographicalZone, geographicalZoneDrawingProps)}
		/>
	{/each}
	<TokyoGenericMapElement
			id={genericVolumeTokyoConverter.getId(volume)}
			getLayer={genericVolumeTokyoConverter.getConverter(volume, volumeDrawingProps)}
	/>
</Tokyo>
<div class="prompt">
	<CButton>Quiero volar aqui</CButton>
</div>

<style lang="scss">
  .prompt {
    position: absolute;
    bottom: 2rem;
    left: 0;
    right: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    user-select: none;
    font-size: 2rem;
    color: var(--white-100);
    background-color: rgba(var(--primary-900-rgb), 0.5);
    padding: 1rem;
  }
</style>
