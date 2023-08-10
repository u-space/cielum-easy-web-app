<script lang="ts">
	import {BaseOperation, Operation} from '@utm-entities/v2/model/operation';
	import DashboardCard from '../../../../commons/components/v2/dashboard/DashboardCard.svelte';
	import i18n from '../../../../i18n/';

	export let operation: Operation | BaseOperation;

</script>


{#each operation.asPrintableEntries() as propvalue (propvalue.property)}
	{@const value = propvalue.value || '(Unknown)'}
	<DashboardCard>
		<svelte:fragment slot="header">{i18n.t('glossary:operation.' + propvalue.property)}</svelte:fragment>
		{i18n.t(value)}
	</DashboardCard>

{/each}
