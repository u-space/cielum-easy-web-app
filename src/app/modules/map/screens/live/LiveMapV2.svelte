<script lang="ts">
	import Dashboard from '../../../../commons/layouts/v2/dashboard/Dashboard.svelte';
	import LiveMapView from './LiveMapView.svelte';
	import env from '../../../../../vendor/environment/env';
	import {getOperationAPIClient} from '@utm-entities/v2/api/operation';
	import {createQuery} from '@tanstack/svelte-query';
	import {BaseOperation, OperationStateEnum} from '@utm-entities/v2/model/operation';
	import * as H from 'history';
	import {PickableType} from '@tokyo/util';
	import {TokyoPick} from '@tokyo/types';
	import OperationDetails from '../../../core_service/operation/components/OperationDetails.svelte';
	import CLoading from '@tokyo/gui/CLoading.svelte';
	import {flyToCenterOfGeometry} from '@tokyo/store';
	import {feature, featureCollection} from '@turf/helpers';
	import {bbox, bboxPolygon} from '@turf/turf';
	import {onMount} from 'svelte';
	import {Geometry} from 'geojson';
	import i18n from '../../../../i18n'

	export let history: H.History;


	// Entity selection logic
	let selected: TokyoPick | null = null;

	function onSelected(pick: TokyoPick) {
		selected = pick;
	}

	function isSelectedOfType(type: PickableType) {
		return selected?.type === type;
	}

	$: selectedOperation = selected?.type === PickableType.Operation ? operations.find(op => op.gufi === selected?.id) : null;


	// Loading of entity selection via query strings
	// This will only work if the query string is set before the component is loaded
	const params = new URLSearchParams(window.location.search);
	const idOperation = params.get('operation');
	const idVolume: number | undefined = Number(params.get('volume')) ?? undefined;

	onMount(() => {
		if (idOperation) {
			selected = {type: PickableType.Operation, id: idOperation, volume: idVolume};
		}
	})

	function centerOnVolume() {
		if (idVolume === undefined) return;
		const volume = selectedOperation?.operation_volumes[idVolume];
		if (volume) {
			flyToCenterOfGeometry(volume.operation_geography as Geometry);
		}
	}

	function centerOnOperationVolumesBbox() {
		const volumes = selectedOperation?.operation_volumes;
		if (volumes) {
			const volumesBbox = bbox(featureCollection(Object.values(volumes).map(volume => feature(volume.operation_geography as Geometry))));
			flyToCenterOfGeometry(bboxPolygon(volumesBbox).geometry);
		}
	}

	$: {
		if (selectedOperation) {
			if (idVolume) {
				centerOnVolume();
			} else {
				centerOnOperationVolumesBbox();
			}
		}
	}

	const states = [OperationStateEnum.PROPOSED, OperationStateEnum.ACCEPTED,
		OperationStateEnum.NOT_ACCEPTED,
		OperationStateEnum.ACTIVATED, OperationStateEnum.CLOSED,
		OperationStateEnum.PENDING, OperationStateEnum.ROGUE];

	const operationAPIClient = getOperationAPIClient(env.core_api, null); // TODO: move to root of new app
	const query = createQuery({
		queryKey: ['operations'],
		queryFn: () => operationAPIClient.getOperations<BaseOperation>('', states),
	});

	$: operations = $query.isSuccess ? $query.data.ops : [];
	$: liveMapViewsProps = {
		operations,
		geographicalZones: [],
		vehiclePositions: new Map(),
		t: i18n.t,
		controlsOptions: {
			geocoder: {
				enabled: true,
				geoapifyApiKey: env.API_keys.geoapify
			}
		}
	};
</script>

<Dashboard canMenuOpen={!!selected}>
	<slot slot="menu">
		{#if selected}
			{#if isSelectedOfType(PickableType.Operation) && selectedOperation}
				<!-- TODO: Do it how it should be done
				<ViewOperationDetails gufi={selected.id}/> -->
				<OperationDetails operation={selectedOperation}/>
			{/if}
		{/if}
	</slot>
	<LiveMapView {...liveMapViewsProps} on:picked={(event) => onSelected(event.detail)}/>
</Dashboard>
{#if $query.isLoading || (idOperation && !selectedOperation)}
	<CLoading/>
{/if}
