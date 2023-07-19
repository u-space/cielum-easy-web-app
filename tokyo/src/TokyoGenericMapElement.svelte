<script lang="ts">
	import {isDeckMounted} from './deck/action';
	import type {Layer} from '@deck.gl/core/typed';
	import {createEventDispatcher, onDestroy, onMount} from 'svelte';
	import {tokyoInternalsDestroyHandler, tokyoInternalsUpdateHandler} from './store';

	export let getLayer: () => Layer;
	export let id: string; // Tokyo ID, not Domain ID.

	function render() {
		if ($isDeckMounted && $tokyoInternalsUpdateHandler) {
			$tokyoInternalsUpdateHandler(getLayer());
		}
	}


	onMount(render);
	$: {
		if (getLayer && $tokyoInternalsUpdateHandler) { // This check mostly helps on making this statement reactive
			render();
		}
	}

	onDestroy(() => {
		if ($tokyoInternalsDestroyHandler) {
			$tokyoInternalsDestroyHandler(id);
		}
	});
</script>

