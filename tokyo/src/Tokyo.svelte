<script lang="ts" context="module">
    import {MapView} from '@deck.gl/core/typed';
    import {Deck} from '@deck.gl/core/typed';
    import {TokyoEditMode, TokyoMapElement, TokyoMapProps, TokyoViewMode} from './TokyoTypes';
    import {Polygon} from 'geojson';

    const initialViewState = {
        latitude: 40.407613,
        longitude: -3.700002,
        zoom: 11,
        bearing: 0,
        pitch: 0,
        //minZoom: 10,
        maxPitch: 0,
        minPitch: 0
    };
    // algo

    const mapView = new MapView({
        id: 'map-base',
        repeat: true,
        controller: {
            scrollZoom: {
                smooth: true,
                speed: 0.025
            }
        }
    });


    export interface TokyoInternalState extends TokyoMapProps {
        deck: Deck;
        view: {
            mode: TokyoViewMode;
            elements: TokyoMapElement[];
        };
        edit: {
            mode: TokyoEditMode;
            single: boolean;
            selected: number | null;
            onEdit: (polygons: Polygon[]) => void;
            onSelect: (polygon: number | null) => void;
            polygons: Polygon[];
        };
    }
</script>

<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import {deck, viewMode, viewState, editMode} from './TokyoStore';
    import {renderLayers} from './internal/renderLayers';
    import {setMapOnClick} from './internal/setMapOnClick';
    import _ from 'lodash';

    export let elements: TokyoMapProps['elements'] = [];
    export let onPick: TokyoMapProps['onPick'] = null;
    export let onEdit: TokyoMapProps['onEdit'];
    export let onEditingPolygonSelect: TokyoMapProps['onEditingPolygonSelect'];
    export let editingSingleVolume: TokyoMapProps['editingSingleVolume'] = false;

    let canvas;
    export let defaultPolygons: TokyoMapProps['defaultPolygons'] = [];
    let editablePolygons: Polygon[] = [];
    let selectedEditablePolygon = null;

    const onEditThrottled = onEdit
        ? _.throttle(onEdit, 1000, {
            leading: false,
            trailing: true
        })
        : null;

    function onInternalEdit(_value) {
        console.log('onInternalEdit', _value);
        let value = _value;
        if (editingSingleVolume && value.length > 1) {
            value = value.slice(0, 1);
        }
        editablePolygons = value;
        if (onEditThrottled) {
            onEditThrottled(value);
        }
    }

    const onInternalEditThrottled = _.throttle(onInternalEdit, 10, {
        leading: false,
        trailing: true
    });

    function onInternalSelect(value) {
        selectedEditablePolygon = value;
        if (onEditingPolygonSelect) onEditingPolygonSelect(value);
    }

    function createMap(preloadedViewState?) {
        $deck = new Deck({
            canvas: canvas,
            initialViewState: preloadedViewState ?? initialViewState,
            onViewStateChange: ({viewState: _viewState}) => {
                $viewState = _viewState;
            },
            views: mapView,
            layerFilter: ({
                              layer,
                              isPicking
                          }) => {
                return !(layer.id === 'TileLayer' && isPicking); // Don't show TileLayer as an picking option
            }
        });
    }

    onMount(() => {
        if (localStorage.getItem('TOKYO_VIEWSTATE')) {
            const viewState = JSON.parse(localStorage.getItem('TOKYO_VIEWSTATE'));
            createMap(viewState);
        } else {
            createMap();
        }
    });

    $: {
        if (defaultPolygons && editablePolygons.length === 0) {
            onInternalEdit(defaultPolygons);
        }
    }
    onDestroy(() => {
        localStorage.setItem('TOKYO_VIEWSTATE', JSON.stringify($viewState));
        $editMode = TokyoEditMode.INACTIVE;
    });

    $: state = {
        deck: $deck as Deck,
        onPick: onPick,
        view: {
            mode: $viewMode as TokyoViewMode,
            elements
        },
        edit: {
            mode: $editMode as TokyoEditMode,
            single: editingSingleVolume,
            selected: selectedEditablePolygon,
            onEdit: onInternalEditThrottled,
            onSelect: onInternalSelect,
            polygons: editablePolygons
        }
    } as TokyoInternalState; // Consume state in called functions directly from here
    $: renderLayers(state);
    $: setMapOnClick(state);
    //$: console.table({ view: state.view, edit: state.edit });
</script>

<div id="tokyo-container" on:contextmenu={(evt) => evt.preventDefault()}>
    <canvas id="map" bind:this={canvas}/>
</div>

<style>
    #tokyo-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    #map {
        left: 0;
    }
</style>
