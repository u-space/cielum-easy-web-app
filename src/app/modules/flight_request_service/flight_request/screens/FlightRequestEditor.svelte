<script lang="ts" context="module">
	type ChooseAreaStepResults = Polygon;

	interface StepState {
		current: 'choose_area' | 'legacy';
		results_choose_area: ChooseAreaStepResults | null;
	}
</script>

<script lang="ts">
	import ChooseAreaStep from '../pages/editor/ChooseAreaStep.svelte';
	import {Polygon} from 'geojson';
	import env from '../../../../../vendor/environment/env';
	import {createQuery} from '@tanstack/svelte-query';
	import {getGeographicalZoneAPIClient} from '@flight-request-entities/geographicalZone';
	import {tokyoViewState} from '@tokyo/store';
	import {WebMercatorViewport} from '@deck.gl/core/typed';
	import CLoading from '@tokyo/gui/CLoading.svelte';

	export let token: string; // TODO: Remove when we have a proper microfrontend app

	let state: StepState = {
		current: 'choose_area',
		results_choose_area: null,
	}

	function onNextChooseAreaStep(event: CustomEvent<ChooseAreaStepResults>) {
		state.results_choose_area = event.detail;
		state.current = 'legacy';
		// TODO: This is temporal while we still have the legacy editor
		window.location.href = window.location.origin + '/editor/flightRequest/' + JSON.stringify(state.results_choose_area);
	}

	// Load data, temporal api calls
	let viewPolygon: Polygon;
	const geographicalZoneAPIClient = getGeographicalZoneAPIClient(env.flight_request_api || '', token); // TODO: move to root of new app
	const query = createQuery({
		queryKey: ['operations'],
		queryFn: () => geographicalZoneAPIClient.getGeographicalZonesIntersecting(viewPolygon),
		enabled: false
	});

	function calculateIntersectingPolygon() {
		const viewport = new WebMercatorViewport($tokyoViewState);
		const width = viewport.width;
		const height = viewport.height;
		const minX = 0
		const minY = 0;
		const maxX = width;
		const maxY = height;
		const topLeft = viewport.unproject([minX, minY]);
		const topRight = viewport.unproject([maxX, minY]);
		const bottomLeft = viewport.unproject([minX, maxY]);
		const bottomRight = viewport.unproject([maxX, maxY]);

		viewPolygon = {
			type: 'Polygon' as const,
			coordinates: [[
				[topLeft[0], topLeft[1]],
				[topRight[0], topRight[1]],
				[bottomRight[0], bottomRight[1]],
				[bottomLeft[0], bottomLeft[1]],
				[topLeft[0], topLeft[1]]
			]]
		};

		$query.refetch();
	}


	$: {
		if ($tokyoViewState) {
			calculateIntersectingPolygon()
		}
	}


</script>

{#if state.current === 'choose_area'}
	<div class="fill">
		<ChooseAreaStep geographicalZones={$query.isSuccess ? $query.data.data.geographicalZones : []}
						on:next={onNextChooseAreaStep}/>
	</div>

	{#if $query.isLoading}
		<CLoading/>
	{/if}
{/if}


<style>
	.fill {
		grid-column: 2 / -1;
	}
</style>
