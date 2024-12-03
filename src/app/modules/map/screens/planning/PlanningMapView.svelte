<svelte:options immutable={true} />

<script lang="ts">
	import Tokyo from '@tokyo/Tokyo.svelte';
	import _ from 'lodash';
	import { renderFlightRequests } from '../../render';
	import { PlanningMapViewProps } from './PlanningMapViewProps';
	import { geographicalZoneTokyoConverter } from '@tokyo/converters/fra/geographicalZone';
	import TokyoGenericMapElement from '@tokyo/TokyoGenericMapElement.svelte';
	import { flightRequestTokyoConverter } from '@tokyo/converters/fra/flightRequest';
	import { EditMode } from '@tokyo/types';

	interface $$Props extends PlanningMapViewProps {}

	export let flightRequests: $$Props['flightRequests'] = [];
	export let geographicalZones: $$Props['geographicalZones'] = [];
	export let selected: $$Props['selected'] = { flightRequest: null };

	$: flightRequestsLayers = renderFlightRequests(flightRequests, selected?.flightRequest || '');
</script>

<Tokyo editOptions={{ mode: EditMode.DISABLED, polygons: [] }}>
	{#each geographicalZones as geographicalZone (geographicalZone.id)}
		<TokyoGenericMapElement
			id={geographicalZoneTokyoConverter.getId(geographicalZone)}
			getLayer={geographicalZoneTokyoConverter.getConverter(geographicalZone, {
				fillAlpha: 20,
				lineAlpha: 20,
				threeDimensional: true
			})}
		/>
	{/each}
	{#each flightRequests as flightRequest (flightRequest.id)}
		<TokyoGenericMapElement
			id={flightRequestTokyoConverter.getId(flightRequest)}
			getLayer={flightRequestTokyoConverter.getConverter(flightRequest)}
		/>
	{/each}
</Tokyo>
