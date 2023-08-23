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

</script>

{#if state.current === 'choose_area'}
	<div class="fill">
		<ChooseAreaStep geographicalZones={[]} on:next={onNextChooseAreaStep}/>
	</div>
{/if}

<style>
	.fill {
		grid-column: 2 / -1;
	}
</style>
