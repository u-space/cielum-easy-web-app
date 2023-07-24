<script lang="ts">
    import {deckAction, isDeckMounted} from './deck/action';
    import {
        tokyoFlyToPosition,
        tokyoInternalsDestroyHandler,
        tokyoInternalsUpdateHandler,
        tokyoViewState
    } from './store';
    import type {Layer} from '@deck.gl/core/typed';
    import {logDebug} from './logger';
    import type {
        DeckActionParams,
        EditHandlers,
        EditParams,
        PickHandler,
        TokyoDispatchedEvent,
        TokyoProps
    } from './types';
    import {BackgroundMode} from './types';
    import {createEventDispatcher, onDestroy, onMount} from 'svelte';
    import CButton from '@tokyo/gui/CButton.svelte';
    import {CTooltipPosition} from '@tokyo/gui/CTooltip';
    import CModal from '@tokyo/gui/CModal.svelte';
    import CGeocoder from '@tokyo/gui/CGeocoder.svelte';
    import {QueryClient, QueryClientProvider} from '@tanstack/svelte-query'
    import {CButtonSize} from '@tokyo/gui/CButton';
    import TokyoGenericMapElement from "@tokyo/TokyoGenericMapElement.svelte";
    import {geolocatorTokyoConverter} from "@tokyo/converters/geolocator";
    import type {Polygon} from "geojson";

    /* Component props */
    export let editOptions: TokyoProps['editOptions'];
    export let mapOptions: TokyoProps['mapOptions'] = {isPickEnabled: true};
    export let controlsOptions: TokyoProps['controlsOptions'] = {
        zoom: {
            enabled: true
        },
        geocoder: {
            enabled: false
        },
        geolocator: {
            enabled: true
        },
        backgroundModeSwitch: {
            enabled: true
        }
    };
    export let t: TokyoProps['t'] = (key: string) => key; // Support for i18n, should be app-provided

    const dispatch = createEventDispatcher<TokyoDispatchedEvent>();

    // State management via controls
    let backgroundMode: BackgroundMode = BackgroundMode.Streets;
    $: backgroundModeSwitchText = backgroundMode === BackgroundMode.Streets ? t('ui:View satellite map') : t('ui:View street map');
    $: backgroundModeSwitchIcon = backgroundMode === BackgroundMode.Streets ? 'globe-hemisphere-west-duotone' : 'globe-duotone';

    function handleBackgroundModeSwitchClick() {
        if (backgroundMode === BackgroundMode.Streets) {
            backgroundMode = BackgroundMode.Satellite;
        } else {
            backgroundMode = BackgroundMode.Streets;
        }
    }

    function flyToGeolocation() {
        if (geolocation) {
            const {
                latitude,
                longitude
            } = geolocation.coords;
            $tokyoFlyToPosition = {
                ...$tokyoFlyToPosition,
                latitude,
                longitude,
                zoom: 16
            };
        } else {
            geolocationNotEnabledOrError = true;
        }
    }

    function handleGeolocateClick() {
        if (!geolocationWatch) {
            navigator.geolocation.getCurrentPosition((position) => {
                geolocation = position;
                flyToGeolocation();
                geolocationWatch = navigator.geolocation.watchPosition(position => geolocation = position);
            }, () => {
                geolocationNotEnabledOrError = true;
            });
        } else {
            flyToGeolocation();
        }
    }

    function zoomIn() {
        $tokyoFlyToPosition = {
            ...$tokyoViewState,
            duration: 100,
            zoom: $tokyoViewState.zoom + 1
        };
    }

    function zoomOut() {
        $tokyoFlyToPosition = {
            ...$tokyoViewState,
            duration: 100,
            zoom: $tokyoViewState.zoom - 1
        };
    }

    // Geolocator logic
    let geolocation = null;
    let geolocationWatch = null;
    let geolocationNotEnabledOrError = false;

    onDestroy(
        () => {
            if (geolocationWatch)
                navigator.geolocation.clearWatch(geolocationWatch);
        }
    )

    // Geocoder visibility state
    let isGeocoderModalVisible = false;

    // Layer management
    let allLayersMap = new Map();
    let pickedLayersMap = new Map();
    let visibleLayersMap = new Map();

    $: {
        if (pickedLayersMap.size > 0) {
            const newVisibleLayersMap = new Map();
            for (const layer of allLayersMap.values()) {
                if (pickedLayersMap.get(layer.id)) {
                    newVisibleLayersMap.set(layer.id, layer.clone());
                } else {
                    newVisibleLayersMap.set(layer.id, layer.clone({opacity: 0.1}));
                }
            }
            visibleLayersMap = newVisibleLayersMap;
        } else {
            visibleLayersMap = allLayersMap;
        }
    }

    let visibleLayersArray = [];
    $: {
        // Calculating the visible layers array from the map, sort by priority
        let lowPriorityLayers = [];
        let normalPriorityLayers = [];
        let highPriorityLayers = [];
        for (const layer of visibleLayersMap.values()) {
            if (layer.id.split('|')[0] === 'operation') {
                normalPriorityLayers.push(layer);
            } else if (layer.id === 'Geolocator' || layer.id.split('|')[0] === 'vehicle') {
                highPriorityLayers.push(layer);
            } else {
                lowPriorityLayers.push(layer);
            }
        }
        visibleLayersArray = [...lowPriorityLayers, ...normalPriorityLayers, ...highPriorityLayers];
    }


    function updateHandler(layer: Layer) {
        allLayersMap = allLayersMap.set(layer.id, layer);
    }

    function destroyHandler(id: string) {
        allLayersMap.delete(id)
        allLayersMap = allLayersMap;
    }

    onMount(() => {
        $tokyoInternalsUpdateHandler = updateHandler;
        $tokyoInternalsDestroyHandler = destroyHandler;
    });

    onDestroy(() => {
        $tokyoInternalsUpdateHandler = null;
        $tokyoInternalsDestroyHandler = null;
    });


    // Deck handlers
    export const pick: PickHandler = (pickings) => {
        dispatch('pick', pickings);
        const newPickedLayers = new Map();
        pickings.forEach((picking) => {
            newPickedLayers.set(picking.layerId, picking);
        })
        pickedLayersMap = newPickedLayers;
    }


    // Edit mode
    let editPolygons: Polygon[] = editOptions.polygons ?? []; // Currently being edited polygons
    let editIndexSelected: number | null = null; // Currently selected polygon index
    const editHandlers: EditHandlers = {
        edit: (polygons) => {
            logDebug('edit', polygons);
            editPolygons = polygons;
            dispatch('edit', polygons);
        },
        select: (index) => {
            logDebug('select', index);
            editIndexSelected = index;
            dispatch('select', index);
        }
    }


    let editParams: EditParams;
    $: editParams = {
        ...editOptions,
        polygons: editPolygons,
        handlers: editHandlers,
        indexSelected: editIndexSelected
    }


    $: deckActionParams = {
        position: $tokyoFlyToPosition,
        mapParams: {
            backgroundMode,
            isPickEnabled: mapOptions.isPickEnabled
        },
        layers: visibleLayersArray,
        handlers: {pick},
        editParams
    } as DeckActionParams;


    const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}> <!-- TODO: remove this when we have a global query client -->
    <div id="tokyo-container" on:contextmenu={(evt) => evt.preventDefault()}>
        <canvas id="tokyo-map"
                use:deckAction={deckActionParams} on:hover>
        </canvas>
        <div id="tokyo-controls">
            {#if controlsOptions.backgroundModeSwitch.enabled}
                <CButton icon={backgroundModeSwitchIcon}
                         size={CButtonSize.EXTRA_LARGE}
                         tooltip={{text: backgroundModeSwitchText, position: CTooltipPosition.Left}}
                         on:click={handleBackgroundModeSwitchClick}/>
            {/if}
            {#if controlsOptions.geolocator.enabled}
                <CButton size={CButtonSize.EXTRA_LARGE} icon="crosshair-duotone"
                         tooltip={{text: t('ui:Geolocate'), position: CTooltipPosition.Left}}
                         on:click={handleGeolocateClick}
                />
            {/if}
            {#if controlsOptions.geocoder.enabled && controlsOptions.geocoder.geoapifyApiKey}
                <CButton size={CButtonSize.EXTRA_LARGE} icon="magnifying-glass-duotone"
                         tooltip={{text: t('ui:Search for a place'), position: CTooltipPosition.Left}}
                         on:click={() => isGeocoderModalVisible = true}/>
                {#if isGeocoderModalVisible}
                    <CModal title={t('ui:Search for a place')} on:close={() => isGeocoderModalVisible = false}>
                        <CGeocoder geaopifyApiKey={controlsOptions.geocoder.geoapifyApiKey}
                                   on:select={() => isGeocoderModalVisible = false}/>
                    </CModal>
                {/if}
            {/if}
            {#if controlsOptions.zoom.enabled}
                <div id="tokyo-zoom">
                    <CButton size={CButtonSize.EXTRA_SMALL} icon="plus-bold"
                             tooltip={{text: t('ui:Zoom in'), position: CTooltipPosition.Left}} on:click={zoomIn}/>
                    <CButton size={CButtonSize.EXTRA_SMALL} icon="minus-bold"
                             tooltip={{text: t('ui:Zoom out'), position: CTooltipPosition.Left}} on:click={zoomOut}/>
                </div>
            {/if}
        </div>
    </div>
    {#if geolocationNotEnabledOrError}
        <CModal title={t('ui:Geolocation')}
                on:close={() => geolocationNotEnabledOrError = false}>
            <p>{t('ui:Geolocation not enabled or error')}</p>
        </CModal>
    {/if}
    <div id="no-render">
        {#if geolocation}
            <TokyoGenericMapElement getLayer={geolocatorTokyoConverter.getConverter(geolocation)}
                                    id={geolocatorTokyoConverter.getId(geolocation)}/>
        {/if}
        <slot/>
    </div>
</QueryClientProvider>


<style>
    #tokyo-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    #tokyo-map {
        left: 0;
        top: 0;
        width: 100%;
    }

    #no-render {
        display: none;
    }

    #tokyo-controls {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 0.3rem;
        top: 0.3rem;
        bottom: 0.3rem;
        right: 0.3rem;
        z-index: var(--z-index-controls);
    }

    #tokyo-zoom {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin-left: auto;
        margin-top: auto;
        gap: 0.25rem;
    }
</style>

