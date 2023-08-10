<script lang="ts">
	import {BaseOperation, Operation} from '@utm-entities/v2/model/operation';
	import DashboardCard from '../../../../commons/components/v2/dashboard/DashboardCard.svelte';

	export let operation: Operation | BaseOperation;

</script>


{#each operation.asPrintableEntries() as propvalue (propvalue.property)}
	{@const value = propvalue.value || '(Unknown)'}
	<DashboardCard>
		<svelte:fragment slot="header">{propvalue.property}</svelte:fragment>
		{value}
	</DashboardCard>

{/each}
