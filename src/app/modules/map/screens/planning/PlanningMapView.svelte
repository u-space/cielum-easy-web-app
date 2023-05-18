<svelte:options immutable={true} />

<script lang="ts">
	import Tokyo from '@tokyo/Tokyo.svelte';
	import _ from 'lodash';
	import { TokyoFlightRequest } from '@tokyo/utm_entities/TokyoFlightRequest';
	import {renderFlightRequests, renderGeographicalZones} from '../../render';
	import {PlanningMapViewProps} from './PlanningMapViewProps';

	interface $$Props extends PlanningMapViewProps {}

	export let flightRequests: $$Props['flightRequests'] = [];
	export let geographicalZones: $$Props['geographicalZones'] = [];
	export let selected: $$Props['selected'] = {};
	export let handlers: $$Props['handlers'] = {};


	$: flightRequestsLayers = renderFlightRequests(flightRequests, selected.flightRequest || '');
	$: geographicalZonesLayers = renderGeographicalZones(geographicalZones, '');
	$: elements = [...geographicalZonesLayers, ...flightRequestsLayers];
</script>

<Tokyo {elements} onPick={handlers.pick} />
