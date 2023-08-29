<script lang="ts">
	import {QueryClient, QueryClientProvider} from '@tanstack/svelte-query'
	import FlightRequestEditor from './FlightRequestEditor.svelte';

	export let token: string;

	const queryClient = new QueryClient()
</script>

<QueryClientProvider client={queryClient}>
	<FlightRequestEditor {token}/>
</QueryClientProvider>

