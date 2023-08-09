<script lang="ts">
	import Dashboard from '../../../../commons/layouts/v2/dashboard/Dashboard.svelte';
	import LiveMapView from './LiveMapView.svelte';
	import env from '../../../../../vendor/environment/env';
	import {getOperationAPIClient} from '@utm-entities/v2/api/operation';
	import {createQuery} from '@tanstack/svelte-query';
	import {BaseOperation, OperationStateEnum} from '@utm-entities/v2/model/operation';

	export let history: History;


	const operationAPIClient = getOperationAPIClient(env.core_api, null); // TODO: move to root of new app

	const states = [OperationStateEnum.PROPOSED, OperationStateEnum.ACCEPTED,
		OperationStateEnum.NOT_ACCEPTED,
		OperationStateEnum.ACTIVATED, OperationStateEnum.CLOSED,
		OperationStateEnum.PENDING, OperationStateEnum.ROGUE];
	const query = createQuery({
		queryKey: ['operations'],
		queryFn: () => operationAPIClient.getOperations<BaseOperation>('', states),
	});


	$: liveMapViewsProps = {
		operations: $query.isSuccess ? $query.data.ops : [],
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

<Dashboard>
	<slot slot="menu">
		<p>Aside 1</p>
		<p>Aside 2</p>
	</slot>
	<LiveMapView {...liveMapViewsProps}/>
</Dashboard>


