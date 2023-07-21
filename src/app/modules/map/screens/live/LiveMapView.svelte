<svelte:options immutable={true}/>

<script lang="ts">
    import Tokyo from '@tokyo/Tokyo.svelte';
    import {LiveMapViewProps} from './LiveMapViewProps.ts';
    import TokyoGenericMapElement from '@tokyo/TokyoGenericMapElement.svelte';
    import {geographicalZoneTokyoConverter} from '@tokyo/converters/fra/geographicalZone';
    import {EditMode, TokyoPick} from '@tokyo/types';
    import CButton from '@tokyo/gui/CButton.svelte';
    import {CTooltipPosition} from '@tokyo/gui/CTooltip';
    import {createEventDispatcher} from "svelte";
    import {CButtonVariant} from "@tokyo/gui/CButton";
    import {operationTokyoConverter} from "@tokyo/converters/core/operation";
    import {Layer} from "leaflet";
    import {
        vehiclePositionHeadTokyoConverter,
        vehiclePositionTailTokyoConverter
    } from "@tokyo/converters/core/position";

    const dispatch = createEventDispatcher<{
        'picked': TokyoPick // ID of Picked Entity
    }>();

    export let t: LiveMapViewProps['t'];
    export let controlsOptions: LiveMapViewProps['controlsOptions'];

    // Items to render
    export let geographicalZones: LiveMapViewProps['geographicalZones'] = [];
    export let operations: LiveMapViewProps['operations'] = [];
    export let vehiclePositions: LiveMapViewProps['vehiclePositions'] = new Map();

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

    // Hover logic
    let hovered: Layer | null = null;

    $: vehiclePositionsEntries = Array.from(vehiclePositions.entries());
</script>

<div id="map_with_fries">
    <Tokyo {t} mapOptions={{isPickEnabled: true}}
           controlsOptions={{...controlsOptions, geolocator: {enabled: true}, backgroundModeSwitch: {enabled: true}}}
           editOptions={{mode: EditMode.DISABLED} }
           on:hover={({detail}) => hovered = detail}
           on:pick={({detail}) => pickings = detail} bind:this={tokyo}>
        {#each operations as operation (operation.gufi)}
            {@const operationDrawingProps = selected && selected.type === 'operation' ? {selected} : undefined }
            <TokyoGenericMapElement
                    id={operationTokyoConverter.getId(operation)}
                    getLayer={operationTokyoConverter.getConverter(operation, operationDrawingProps)}

            />
        {/each}
        {#each geographicalZones as geographicalZone (geographicalZone.id)}
            <TokyoGenericMapElement
                    id={geographicalZoneTokyoConverter.getId(geographicalZone)}
                    getLayer={geographicalZoneTokyoConverter.getConverter(geographicalZone)}

            />
        {/each}
        {#each vehiclePositionsEntries as [id, positions] (id)}
            <TokyoGenericMapElement
                    id={vehiclePositionHeadTokyoConverter.getId(positions[positions.length - 1])}
                    getLayer={vehiclePositionHeadTokyoConverter.getConverter(positions[positions.length - 1])}/>
            {#if positions.length > 1}
                <TokyoGenericMapElement
                        id={vehiclePositionTailTokyoConverter.getId(positions)}
                        getLayer={vehiclePositionTailTokyoConverter.getConverter(positions)}/>
            {/if}
        {/each}
    </Tokyo>
    <div id='fries' style:width={pickings.length > 0 ? '200px' : '0px'}>
        <div>
            <CButton icon="x" variant={CButtonVariant.DANGER} fill on:click={() => tokyo.pick([])}/>

        </div>
        {#each pickings as pick}
            {@const subtitle = pick.volume ? `${t(pick.type)} (Vol. ${pick.volume + 1})` : t(pick.type)}
            <div>
                <h2>{subtitle}</h2>
                <CButton on:click={() => dispatch('picked', pick)} fill
                         tooltip={{text: pick.name, position: CTooltipPosition.Left}}>{pick.name}</CButton>
            </div>
        {/each}
    </div>
    {#if hovered}
        <div id="hovered_info">
            {hovered.id.split('|')[2] || hovered.id}
        </div>
    {/if}
</div>

<style lang="scss">
  #map_with_fries {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
  }

  #fries {
    overflow: visible;
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
    right: 1rem;
    background-color: var(--primary-800);
    color: var(--white-100);
    z-index: var(--z-index-fries);
  }
</style>
