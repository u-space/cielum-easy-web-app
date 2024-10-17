<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import LiveMapV2 from './LivePublicMapV2.svelte';

	export let history: History;

	const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
	<LiveMapV2 {history} />
</QueryClientProvider>
