<script lang="ts">
	import Dashboard from '../../../../commons/layouts/v2/dashboard/Dashboard.svelte';
	import LiveMapView from './LiveMapView.svelte';
	import env from '../../../../../vendor/environment/env';
	import {getOperationAPIClient} from '@utm-entities/v2/api/operation';
	import {createQuery} from '@tanstack/svelte-query';
	import {BaseOperation, OperationStateEnum} from '@utm-entities/v2/model/operation';
	import * as H from 'history';
	import {PickableType} from '@tokyo/util';
	import {TokyoPick, TokyoPickableElement} from '@tokyo/types';
	import ViewOperationDetails from '../../../core_service/operation/pages/ViewOperationDetails.svelte';
	import OperationDetails from '../../../core_service/operation/components/OperationDetails.svelte';
	import CModal from '@tokyo/gui/CModal.svelte';
	import CLoading from '@tokyo/gui/CLoading.svelte';
	import {flyToCenterOfGeometry} from '@tokyo/store';
	import {feature, featureCollection} from '@turf/helpers';
	import {bbox, bboxPolygon} from '@turf/turf';

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
	const params = new URLSearchParams(window.location.search);
	const idOperation = params.get('operation');

	$: {
		if (idOperation) {
			selected = {type: PickableType.Operation, id: idOperation};
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
		t: (key: string) => key,
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
