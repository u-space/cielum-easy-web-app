/* stylelint-disable */
<svelte:options immutable={true} />

<script lang="ts">
	import Tokyo from '@tokyo/Tokyo.svelte';
	import { TokyoOperation } from '@tokyo/utm_entities/TokyoOperation';
	import _ from 'lodash';
	import { TokyoVehicle } from '@tokyo/utm_entities/TokyoVehicle';
	import { TokyoRestrictedFlightVolume } from '@tokyo/utm_entities/TokyoRestrictedFlightVolume';
	import { TokyoUASVolumeReservation } from '@tokyo/utm_entities/TokyoUASVolumeReservation';
	import { LiveMapViewProps } from './LiveMapViewProps.ts';
	import { renderGeographicalZones } from '../../render';

	interface $$Props extends LiveMapViewProps {}

	export let operations: $$Props['operations'] = [];
	export let selected: $$Props['selected'] = {};
	export let geographicalZones: $$Props['geographicalZones'] = [];
	export let rfvs: $$Props['rfvs'] = [];
	export let uvrs: $$Props['uvrs'] = [];
	export let vehicles: $$Props['vehicles'] = [];
	export let handlers: $$Props['handlers'] = {};

	function renderOperations(operations, idOperation, idVolume) {
		if (operations) {
			return _.cloneDeep(
				// TODO: Stop cloning deep when we stop using observables
				operations.map((op) => {
					return new TokyoOperation(op, op.gufi === idOperation, idVolume);
				})
			);
		} else {
			return [];
		}
	}

	function renderVehicles(vehicles, onVehicleClick) {
		if (vehicles && vehicles.length > 0) {
			const items = _.cloneDeep(vehicles);
			return items.map((v) => {
				return new TokyoVehicle(v, onVehicleClick(v));
			});
		} else {
			return [];
		}
	}

	function renderRfvs(rfvs) {
		if (rfvs) {
			const items = _.cloneDeep(rfvs);
			return items.map((rfv) => {
				return new TokyoRestrictedFlightVolume(rfv);
			});
		} else {
			return [];
		}
	}

	function renderUvrs(uvrs) {
		if (uvrs) {
			const items = _.cloneDeep(uvrs);
			return items.map((uvr) => {
				return new TokyoUASVolumeReservation(uvr);
			});
		} else {
			return [];
		}
	}

	$: operationsLayers = renderOperations(operations, selected.gufi, selected.volume);
	$: geographicalZonesLayers = renderGeographicalZones(
		geographicalZones,
		selected.geographicalZone
	);
	$: rfvsLayers = renderRfvs(rfvs);
	$: uvrsLayers = renderUvrs(uvrs);
	$: vehiclesLayers = renderVehicles(vehicles, handlers.vehicleClick);
	$: elements = [
		...rfvsLayers,
		...uvrsLayers,
		...geographicalZonesLayers,
		...operationsLayers,
		...vehiclesLayers
	];
</script>

<Tokyo {elements} onPick={handlers.pick} />
