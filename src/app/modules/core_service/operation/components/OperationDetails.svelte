<script lang="ts">
	import { BaseOperation, Operation } from '@utm-entities/v2/model/operation';
	import DashboardCard from '../../../../commons/components/v2/dashboard/DashboardCard.svelte';
	import i18n from '../../../../i18n/';

	export let operation: Operation | BaseOperation;

	// let vehicleIter = 1;
	// operation.asPrintableEntries().map((propvalue) => {
	// 	propvalue.property === 'vehicle'
	// 		? { ...propvalue, property: `vehicle${vehicleIter++}` }
	// 		: propvalue;
	// });

	let printableEntries: { property: string; value: string; translatableValue: boolean }[] = [];

	$: {
		let vehicleIter = 1;
		printableEntries = operation.asPrintableEntries().map((propvalue) => {
			if (propvalue.property === 'vehicle') {
				return { ...propvalue, property: `vehicle${vehicleIter++}` };
			}
			return propvalue;
		});
	}
</script>

{#each printableEntries as propvalue (propvalue.property)}
	{@const value = propvalue.value || `(${i18n.t('Unknown')})`}
	<DashboardCard>
		<svelte:fragment slot="header"
			>{i18n.t('glossary:operation.' + propvalue.property)}</svelte:fragment
		>
		{propvalue.translatableValue ? i18n.t(value) : value}
	</DashboardCard>
{/each}
