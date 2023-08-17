<script lang="ts">
	import {createQuery} from '@tanstack/svelte-query';
	import {getOperationAPIClient} from '@utm-entities/v2/api/operation';
	import env from '../../../../../vendor/environment/env';
	import OperationDetails from '../components/OperationDetails.svelte';

	export let gufi: string;

	const operationAPIClient = getOperationAPIClient(env.core_api, null); // TODO: move to root of new app
	const query = createQuery({
		queryKey: ['operation'],
		queryFn: () => operationAPIClient.getOperation(gufi),
	});

	// TODO: Add proper loading indicator
</script>

{#if $query.isLoading}
	Loading...
{:else if $query.isSuccess}
	<OperationDetails operation={$query.data}/>
{/if}
