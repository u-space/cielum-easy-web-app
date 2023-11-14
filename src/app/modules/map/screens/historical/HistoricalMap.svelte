<script lang="ts">
	import i18n from '../../../../i18n';
	import Dashboard from '../../../../commons/layouts/v2/dashboard/Dashboard.svelte';
	import LiveMapView from '../live/LiveMapView.svelte';
	import env from '../../../../../vendor/environment/env';
	import {getPositionAPIClient, PositionEntity} from '@utm-entities/position';
	import {getQueryStringSelection, QueryStringSelection} from '../../../core_service/query_string_selection_load';
	import {CModalVariant} from '@tokyo/gui/CModal';
	import CModal from '@tokyo/gui/CModal.svelte';
	import {getOperationAPIClient} from '@utm-entities/v2/api/operation';
	import {createQuery} from '@tanstack/svelte-query';
	import {
		BaseOperation,
		Operation,
		OPERATION_LOCALES_OPTIONS,
		OperationStateEnum
	} from '@utm-entities/v2/model/operation';
	import OperationDetails from '../../../core_service/operation/components/OperationDetails.svelte';
	import {AdesRole} from '@utm-entities/_util';
	import {flyToCenterOfGeometry} from '@tokyo/store';
	import {Geometry} from 'geojson';
	import PastPositionsPlayer from './PastPositionsPlayer.svelte';

	export let token: string;

	let isLoading = false;
	let selected: QueryStringSelection = getQueryStringSelection();

	const states = [OperationStateEnum.PROPOSED, OperationStateEnum.ACCEPTED,
		OperationStateEnum.NOT_ACCEPTED,
		OperationStateEnum.ACTIVATED, OperationStateEnum.CLOSED,
		OperationStateEnum.PENDING, OperationStateEnum.ROGUE];

	const operationAPIClient = getOperationAPIClient(env.core_api, token); // TODO: move to root of new app
	const query = createQuery({
		queryKey: ['operations'],
		queryFn: () => operationAPIClient.getOperations<Operation>(AdesRole.ADMIN, states, 1, 0, 'gufi', 'ASC', 'gufi', selected ? selected.id : ''),
	});

	$: operation = $query.data ? $query.data.ops[0] : null;

	let rangeFrom: Date;
	let rangeTo: Date;
	let vehiclePositions: Map<string, PositionEntity[]> = new Map();
	const setInitialTimes = (time: number, from: Date, to: Date) => {
		rangeFrom = from;
		rangeTo = to;
	}

	$: {
		if (operation) {
			setInitialTimes(operation.begin?.getTime() || 0, operation.begin!, operation.end!);
			flyToCenterOfGeometry(operation.operation_volumes[0].operation_geography as Geometry);
		}
	}

	$: liveMapViewsProps = {
		operations: operation ? [operation] : [],
		geographicalZones: [],
		vehiclePositions,
		t: i18n.t,
		controlsOptions: {
			geocoder: {
				enabled: true,
				geoapifyApiKey: env.API_keys.geoapify
			}
		}
	};
</script>

<Dashboard {isLoading} canMenuOpen={!!operation}>
	<LiveMapView {...liveMapViewsProps}/>
	<slot slot="menu">
		{#if operation}
			<OperationDetails operation={operation}/>
		{/if}
	</slot>
	{#if operation}
		<div class="player">
			{#if selected?.id && rangeFrom && rangeTo}
				<PastPositionsPlayer token={token} gufi={selected.id} from={rangeFrom} to={rangeTo}
									 on:positions={(evt) => vehiclePositions = evt.detail}/>
			{/if}
		</div>
	{/if}
</Dashboard>
{#if !selected}
	<CModal
			title={i18n.t('There is no operation with the specified id')}
			variant={CModalVariant.ERROR}
			closeText={i18n.t('Close') || 'Close'}
			on:close={() => window.location.href = window.location.origin + '/operations'}>
		<!-- TODO: Update this call when using a Svelte router -->
		{i18n.t("Please check that no characters are missing from the URL and try again")}
	</CModal>
{/if}

<style lang="scss">
  .player {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    color: white;
    background-color: var(--primary-900);
    padding: 0.5rem 4rem 0.5rem 1rem;
  }
</style>
