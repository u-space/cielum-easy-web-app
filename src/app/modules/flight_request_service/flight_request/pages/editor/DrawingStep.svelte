<script lang="ts">
	import ChooseAreaMapView from '../../../../map/screens/editor/ChooseAreaMapView.svelte';

	enum DrawingStepStage {
		"choose_area",
		"edit"
	}

	let stage: DrawingStepStage = DrawingStepStage.choose_area;
</script>

{#if stage === DrawingStepStage.choose_area}
	<div class="fill">
		<ChooseAreaMapView geographicalZones={[]}/>
	</div>
{:else}
	<h1>Nothing yet</h1>
{/if}

<style>
	.fill {
		grid-column: 2 / -1;
	}
</style>
