<svelte:options immutable={true}/>

<script lang="ts">
	import Tokyo from '@tokyo/Tokyo.svelte';
	import {LiveMapViewProps} from './LiveMapViewProps.ts';
	import TokyoGenericMapElement from '@tokyo/TokyoGenericMapElement.svelte';
	import {geographicalZoneTokyoConverter} from '@tokyo/converters/fra/geographicalZone';
	import {EditMode, TokyoPick} from '@tokyo/types';
	import CButton from '@tokyo/gui/CButton.svelte';
	import {CTooltipPosition} from '@tokyo/gui/CTooltip';
	import {createEventDispatcher, onMount} from "svelte";
	import {CButtonVariant} from "@tokyo/gui/CButton";
	import {operationTokyoConverter} from "@tokyo/converters/core/operation";
	import {Layer} from "@deck.gl/core/typed";
	import {
		vehiclePositionHeadLabelTokyoConverter,
		vehiclePositionHeadProjectionTokyoConverter,
		vehiclePositionHeadTokyoConverter,
		vehiclePositionTailTokyoConverter
	} from "@tokyo/converters/core/position";
	import {CSize} from "@tokyo/gui/CSizeWrapper";
	import CModal from "@tokyo/gui/CModal.svelte";
	import CPanel from "@tokyo/gui/CPanel.svelte";
	import CCheckbox from "@tokyo/gui/CCheckbox.svelte";
	import {CCheckboxCheckedEvent} from "@tokyo/gui/CCheckbox";
	import {isTouchDevice} from '@tokyo/util';
	import LiveMapPick from './LiveMapPick.svelte';

	const dispatch = createEventDispatcher<{
		'picked': TokyoPick // ID of Picked Entity
	}>();

	export let t: LiveMapViewProps['t'];
	export let controlsOptions: LiveMapViewProps['controlsOptions'];

	// Items to render
	export let geographicalZones: LiveMapViewProps['geographicalZones'] = [];
	export let operations: LiveMapViewProps['operations'] = [];
	export let vehiclePositions: LiveMapViewProps['vehiclePositions'] = new Map();
	$: vehiclePositionsEntries = Array.from(vehiclePositions.entries());

	export let selected: LiveMapViewProps['selected'] = null;


	// Picking logic, displayal on side
	let pickings: TokyoPick[] = [];
	let tokyo: Tokyo;

	$: {
		// Automatically select first pick if only one pick is available
		if (pickings.length === 1) {
			dispatch('picked', pickings[0]);
			tokyo.pick([]);
		}
	}

	function onSelectPick(event: CustomEvent<TokyoPick>) {
		dispatch('picked', event.detail);
	}

	// Layer control logic
	let isShowingLayersPanel = false;
	let visible = {
		operations: true,
		rfvs: true,
		geographical_zones: true,
		vehicles: true
	}

	$: visibleVehiclePositionsEntries = visible.vehicles ? vehiclePositionsEntries : [];

	$: visibleOperations = visible.operations ? operations : [];
	$: visibleGeographicalZones = visible.geographical_zones ? geographicalZones : [];

	function toggleLayersPanel() {
		isShowingLayersPanel = !isShowingLayersPanel
	}

	const onLayerChecked = ({detail}: CCheckboxCheckedEvent) => {
		const {id, checked} = detail;
		const type = id.split('-')[1];
		visible = {
			...visible,
			[type]: checked
		}
	}

	// Hover logic
	let hovered: string | null = null;

	const defaultOperationDrawingProps = {
		t,
	}

	// Resize logic
	let isMinWidth = false;
	onMount(() => {
		const mediaQuery = window.matchMedia('(min-width: 900px)');
		const updateMinWidth = () => {
			isMinWidth = mediaQuery.matches;
		}
		mediaQuery.addEventListener('change', updateMinWidth);
		updateMinWidth();
		return () => mediaQuery.removeEventListener('change', updateMinWidth);
	})
</script>

<div id="map_with_fries">
	<!-- Using isTouchDevice is a temporal fix -->
	<div id='fries' style:width={pickings.length > 0 ? !isMinWidth ? '100%' : '400px' : '0px'}>
		<div>
			<CButton icon="x" variant={CButtonVariant.DANGER} fill on:click={() => tokyo.pick([])}/>

		</div>
		{#each pickings as pick}
			<!--
				{@const subtitle = pick.volume ? `${t(pick.type)} (Vol. ${pick.volume + 1})` : t(pick.type)}
				<div>
					<h2>{subtitle}</h2>
					<p>{JSON.stringify(pick.properties)}</p>
					<CButton on:click={() => dispatch('picked', pick)} fill
							 tooltip={{text: pick.name, position: CTooltipPosition.Left}}>{pick.name}</CButton>
				</div> -->
			<LiveMapPick pick={pick} on:select={onSelectPick}/>
		{/each}
	</div>
	<Tokyo {t} mapOptions={{isPickEnabled: true}}
		   controlsOptions={{zoom: { enabled: true}, backgroundModeSwitch: {enabled: true}, geocoder: {enabled: false}, geolocator: {enabled: true},...controlsOptions}}
		   editOptions={{mode: EditMode.DISABLED} }
		   on:hover={({detail}) => hovered = detail}
		   on:pick={({detail}) => pickings = detail} bind:this={tokyo}>
		<!-- Map Elements -->
		{#each visibleVehiclePositionsEntries as [id, positions] (id)}

			<TokyoGenericMapElement
					id={vehiclePositionHeadTokyoConverter.getId(positions[positions.length - 1])}
					getLayer={vehiclePositionHeadTokyoConverter.getConverter(positions[positions.length - 1], {t})}/>
			<TokyoGenericMapElement
					id={vehiclePositionHeadLabelTokyoConverter.getId(positions[positions.length - 1])}
					getLayer={vehiclePositionHeadLabelTokyoConverter.getConverter(positions[positions.length - 1], {size: 20})}/>
			<TokyoGenericMapElement
					id={vehiclePositionHeadProjectionTokyoConverter.getId(positions[positions.length - 1])}
					getLayer={vehiclePositionHeadProjectionTokyoConverter.getConverter(positions[positions.length - 1])}/>
			{#if positions.length > 1}
				<TokyoGenericMapElement
						id={vehiclePositionTailTokyoConverter.getId(positions)}
						getLayer={vehiclePositionTailTokyoConverter.getConverter(positions)}/>
			{/if}
		{/each}
		{#each visibleOperations as operation (operation.gufi)}
			{@const operationDrawingProps = selected && selected.type === 'operation' ? {selected} : undefined }
			<TokyoGenericMapElement
					id={operationTokyoConverter.getId(operation)}
					getLayer={operationTokyoConverter.getConverter(operation, {...defaultOperationDrawingProps, ...operationDrawingProps})}

			/>
		{/each}
		{#each visibleGeographicalZones as geographicalZone (geographicalZone.id)}
			<TokyoGenericMapElement
					id={geographicalZoneTokyoConverter.getId(geographicalZone)}
					getLayer={geographicalZoneTokyoConverter.getConverter(geographicalZone)}

			/>
		{/each}

		<div class="controls" slot="extra_controls">

			{#if isShowingLayersPanel}
				<CPanel>
					<div class="layers-panel">
						<CButton icon="x" variant={CButtonVariant.DANGER} size={CSize.EXTRA_SMALL}
								 on:click={toggleLayersPanel}/>
						<CCheckbox fill id="toggle-operations" label={t('OPERATIONS')} checked={visible.operations}
								   on:check={onLayerChecked}/>
						<CCheckbox fill id="toggle-rfvs" label={t('RFVS')} checked={visible.rfvs}
								   on:check={onLayerChecked}/>
						<CCheckbox fill id="toggle-geographical_zones" label={t('GEOGRAPHICAL ZONES')}
								   on:check={onLayerChecked}
								   checked={visible.geographical_zones}/>
						<CCheckbox fill id="toggle-vehicles" label={t('Vehicles')} checked={visible.vehicles}
								   on:check={onLayerChecked}/>
					</div>
				</CPanel>
			{/if}
			<CButton icon="stack-duotone"
					 tooltip={{text: t('ui:Layers'), position: CTooltipPosition.Left}} size={CSize.EXTRA_LARGE}
					 on:click={toggleLayersPanel}/>
		</div>
	</Tokyo>
	<!-- This works properly
	{#if hovered && isTouchDevice}
		<div id="hovered_info">
			{@html hovered}
		</div>
	{/if}-->
</div>


<style lang="scss">
  #map_with_fries {
    position: relative;
    display: flex;
    flex-direction: row-reverse;
    width: 100%;
    height: 100%;
  }

  #fries {
    height: 100%;
    overflow: auto;
    flex-shrink: 0;
    background-color: var(--primary-800);
    transition: width 0.5s;
    color: var(--white-100);
    z-index: var(--z-index-fries);

    & > div {
      margin: 1rem;


      & h2 {
        font-size: 0.75rem;
        color: var(--mirai-200);
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }
    }
  }

  #hovered_info {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    background-color: var(--primary-800);
    color: var(--white-100);
    z-index: var(--z-index-hovered);
    padding: 0.5rem;

    & :global(h1) {
      font-size: 1rem;
    }

    & :global(h2) {
      color: var(--mirai-100);
      font-size: 0.95rem;
    }

    & :global(.tooltip-property) {
      font-weight: 900;
    }
  }

  .layers-panel {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
    gap: 0.5em;
  }

  .controls {
    display: flex;
    justify-content: flex-end;
    gap: 0.5em;
  }
</style>
