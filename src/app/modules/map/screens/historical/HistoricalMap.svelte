<script lang="ts">
    import i18n from '../../../../i18n';
    import Dashboard from '../../../../commons/layouts/v2/dashboard/Dashboard.svelte';
    import LiveMapView from '../live/LiveMapView.svelte';
    import env from '../../../../../vendor/environment/env';
    import {PositionEntity} from '@utm-entities/position';
    import {getQueryStringSelection, QueryStringSelection} from '../../../core_service/query_string_selection_load';
    import {CModalVariant} from '@tokyo/gui/CModal';
    import CModal from '@tokyo/gui/CModal.svelte';
    import {getOperationAPIClient} from '@utm-entities/v2/api/operation';
    import {createQuery} from '@tanstack/svelte-query';
    import {BaseOperation, OPERATION_LOCALES_OPTIONS, OperationStateEnum} from '@utm-entities/v2/model/operation';

    let isLoading = false;
    //let vehiclePositions: Map<String, PositionEntity[]> = new Map();

    let selected: QueryStringSelection = getQueryStringSelection();

    const states = [OperationStateEnum.PROPOSED, OperationStateEnum.ACCEPTED,
        OperationStateEnum.NOT_ACCEPTED,
        OperationStateEnum.ACTIVATED, OperationStateEnum.CLOSED,
        OperationStateEnum.PENDING, OperationStateEnum.ROGUE];

    const operationAPIClient = getOperationAPIClient(env.core_api, null); // TODO: move to root of new app
    const query = createQuery({
        queryKey: ['operations'],
        queryFn: () => operationAPIClient.getOperations<BaseOperation>('', states, 1, 0, 'gufi', 'ASC', 'gufi', selected ? selected.id : ''),
    });

    $: operation = $query.data ? $query.data.ops[0] : null;
    let currentTime = 0;

    $: liveMapViewsProps = {
        operations: [],
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

<Dashboard {isLoading}>
    <LiveMapView {...liveMapViewsProps}/>
    {#if operation}
        <div class="player">
            <label for="player_seek">{(new Date(currentTime)).toLocaleString(
                [],
                OPERATION_LOCALES_OPTIONS
            )}</label>
            <input type="range" id="player_seek" min={operation.begin?.getTime()} max={operation.end?.getTime()}
                   bind:value={currentTime}>
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
    background-color: red;
    padding: 0.5rem 4rem 0.5rem 1rem;

    & #player_seek {
      width: 100%;
    }
  }
</style>
