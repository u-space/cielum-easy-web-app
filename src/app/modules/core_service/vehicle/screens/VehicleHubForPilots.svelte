<script lang="ts">
	import Page from '../../../../commons/layouts/v2/page/Page.svelte';
	import i18n from 'i18next'
	import {VehicleEntity} from '@utm-entities/vehicle';
	import CButton from '@tokyo/gui/CButton.svelte';

	export let history: any; // TODO: remove when we have proper standalone frontend
	export let vehicles: VehicleEntity[];

	function getOnClickHandler(uvin: string) {
		return (event: MouseEvent) => {
			event.preventDefault();
			history.push(`/vehicles/${uvin}`);
		}
	}

</script>

<Page>
	<svelte:fragment slot="header">
		{i18n.t('Your vehicles')}
	</svelte:fragment>
	<ul class="aircraft_list">
		{#each vehicles as vehicle (vehicle.uvin)}
			<a href={'#'} class="aircraft" on:click={getOnClickHandler(vehicle.uvin)}>
				<h1>{vehicle.vehicleName}</h1>
				<h2>{vehicle.model} ({vehicle.manufacturer})</h2>
				<h3>#{vehicle.extra_fields?.serial_number || vehicle.licensePlate}</h3>
				<h4 class={vehicle.authorized}>{i18n.t(vehicle.authorized)}</h4>
				<h5>{i18n.t(vehicle.class)}</h5>
			</a>
		{/each}
	</ul>
	<svelte:fragment slot="footer">
		<CButton icon="plus" on:click={() => history.push('/editor/vehicle')}>{i18n.t('Add new')}</CButton>
	</svelte:fragment>
</Page>

<style lang="scss">
  $aircraft-min-width: 300px;
  $item-decoration-offset: 1em;
  $shift-action: 0.15em;
  .aircraft_list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax($aircraft-min-width, 1fr));
    grid-template-rows: repeat(auto-fit, 6rem);
    grid-gap: 0.8em;

    margin: 0;
    padding: 1em;

    & .aircraft {
      flex: 1;

      position: relative;
      list-style: none;
      min-width: $aircraft-min-width;

      padding: 0.5em 0.5em 0.5em 2 * $item-decoration-offset;

      height: 6em;
      font-size: 1em;
      background-color: var(--white-100);
      text-decoration: none;

      box-shadow: 0 0 0.5em -0.1em rgba(var(--mirai-900), 0.5);

      & > * {
        margin: 0;
      }

      & h1 {
        font-size: 1em;
        color: var(--primary-900);
        font-weight: 900;
      }

      & h2 {
        font-size: 1em;
        font-weight: 400;
        color: var(--mirai-900);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }

      & h3 {
        font-size: 0.9em;
        font-weight: 200;
        color: var(--mirai-900);
      }

      & h4 {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;

        font-weight: 200;
        color: var(--mirai-900);
        writing-mode: vertical-lr;
        transform: rotate(180deg);
        font-size: 0.8em;
        padding: 0.4em;
        text-align: center;

        &.NOT_AUTHORIZED {
          background-color: var(--ramen-500);
        }

        &.AUTHORIZED {
          background-color: var(--yamate-500);
        }

        &.PENDING {
          background-color: var(--kannai-500);
        }
      }

      & h5 {
        font-size: 0.9em;
        font-weight: 200;
        color: var(--mirai-400);
      }


      &:hover {
        transform: translateY(-$shift-action);
      }

      &:active {
        transform: translateY($shift-action);
        outline: none;
      }

      &:focus {
        outline: 1px solid var(--primary-500);
      }
    }
  }
</style>
