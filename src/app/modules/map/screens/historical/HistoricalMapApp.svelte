<script lang="ts">
	import {QueryClient, QueryClientProvider} from '@tanstack/svelte-query'
	import HistoricalMap from './HistoricalMap.svelte';

	export let history: History;
	export let token: string;

	const queryClient = new QueryClient()
</script>

<QueryClientProvider client={queryClient}>
	<div class="temp_layout_filler">
		<HistoricalMap {token} {history}/>
	</div>
</QueryClientProvider>

<style lang="scss">
  .temp_layout_filler {
    grid-column: span 3;
    position: relative;
  }
</style>
