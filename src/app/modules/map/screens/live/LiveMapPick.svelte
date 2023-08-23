<script lang="ts">
	import {TokyoPick} from '@tokyo/types';
	import i18n from '../../../../i18n';
	import {Operation, OperationState} from '@utm-entities/v2/model/operation';
	import {OPERATION_STATE_COLORS_CSS} from '@tokyo/TokyoDefaults';
	import {createEventDispatcher} from 'svelte';

	export let pick: TokyoPick;
	const dispatch = createEventDispatcher<{ 'select': TokyoPick }>();

	// Following code is J. Cetraro's. No translations are provided.
	function getOperationPeriod(operation: Operation) {
		// calculate from and to
		let timestampFrom: number = Number.MAX_VALUE;
		let timestampTo: number = Number.MIN_VALUE;
		for (const volume of operation.operation_volumes) {
			timestampFrom = Math.min(
				(volume.effective_time_begin as Date)
					.getTime(),
				timestampFrom
			);
			timestampTo = Math.max(
				(volume.effective_time_end as Date).getTime(),
				timestampTo
			);
		}

		const fromDayDescription = getDayDescription(new Date(timestampFrom));
		const toDayDescription = getDayDescription(new Date(timestampTo));
		const fromTimeDescription = new Date(timestampFrom)
			.toTimeString()
			.substring(0, 5);
		const toTimeDescription = new Date(timestampTo)
			.toTimeString()
			.substring(0, 5);

		if (fromDayDescription === toDayDescription) {
			// operation starts and ends in the same day
			return `${fromDayDescription}, de ${fromTimeDescription} a ${toTimeDescription}`;
		} else {
			// operation starts and ends in different days
			return `Del ${fromDayDescription} a las ${fromTimeDescription} hasta el ${toDayDescription} a las ${toTimeDescription}`;
		}
	}

	function getDayDescription(date: Date) {
		const dateNow = new Date();
		const dateTomorrow = new Date(dateNow.getTime() + 1000 * 60 * 60 * 24);
		const strDateNow = dateNow.toDateString();
		const strDateTomorrow = dateTomorrow.toDateString();
		const strDateReceived = date.toDateString();
		if (strDateReceived === strDateNow) return "Hoy";
		else if (strDateReceived === strDateTomorrow) return "Mañana";
		const day = date.getDate();
		const monthName = [
			"enero",
			"febrero",
			"marzo",
			"abril",
			"mayo",
			"junio",
			"julio",
			"agosto",
			"septiembre",
			"octubre",
			"noviembre",
			"diciembre",
		][date.getMonth()];
		const year = date.getFullYear();
		return `${day} de ${monthName} de ${year}`;
	}

	$: stateColor = pick.properties?.operation ? OPERATION_STATE_COLORS_CSS[pick.properties.operation.state as keyof typeof OPERATION_STATE_COLORS_CSS] : undefined;

</script>

<button class="pick" style:--state-color={stateColor} on:click={() => dispatch('select', pick)}>
	{#if pick.properties}
		{#if pick.properties.operation && pick.properties.volume}
			<!-- This section is displayed as per spec designed by J. Cetraro. Please ask him for questions. -->
			{@const operation = pick.properties.operation}
			{@const volume = pick.properties.volume}
			<div class="properties">
				<h1>{operation.name}</h1>
				<h2>{operation.gufi}</h2>
				<h3>{getOperationPeriod(operation)}</h3>
				<label for="max_altitude">{i18n.t('glossary:volume.max_altitude')}</label>
				<p id="max_altitude">{volume.max_altitude}</p>
				{#if operation.uas_registrations.length > 1}
					<label for="uas_registrations">{i18n.t('glossary:operation.uas_registrations')}</label>
					<ul id="uas_registrations">
						{#each operation.uas_registrations as vehicle}
							<li>{vehicle.displayName}</li>
						{/each}
					</ul>
				{:else if operation.uas_registrations.length === 1}
					<label for="uas_registration">{i18n.t('glossary:operation.uas_registration')}</label>
					<p id="uas_registration">{operation.uas_registrations[0].displayName}</p>
				{/if}
			</div>
			<div class="label">
				{i18n.t(operation.state)}
			</div>
		{/if}
	{:else}
		<!-- Default pick render, still no properties -->
	{/if}
</button>

<style lang="scss">
  .pick {
    margin: 1rem;

    display: flex;
    align-items: stretch;

    background-color: var(--state-color);

    padding: 0;

    // reset
    color: var(--white-100);
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    border: none;

    &:hover {
      cursor: pointer;
    }

    & .properties {
      flex: 1;

      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
      flex-direction: column;
      padding: 1rem;

      font-size: 1rem;
      //background-color: rgba(var(--primary-900-rgb), 0.7);
      background-color: var(--primary-900);

      &:hover {
        background-color: var(--primary-600);
      }


      & h1 {
        font-size: 1.2em;
        color: var(--white-100);
      }

      & h2 {
        font-size: 0.9em;
        text-align: left;
        color: var(--mirai-400);
      }

      & h3 {
        font-weight: normal;
        text-align: left;
        font-size: 1em;
      }

      & p {
        margin: 0;
      }

      & label {
        font-weight: bold;
        color: var(--primary-300);
        margin-top: 1em;
      }

      & ul {
        margin: 0;
        padding-left: 1.5em;
      }
    }

    & .label {
      display: flex;
      justify-content: center;

      writing-mode: vertical-lr;
      transform: rotate(180deg);
      font-size: 1.5em;

      color: var(--primary-900);
    }
  }
</style>
