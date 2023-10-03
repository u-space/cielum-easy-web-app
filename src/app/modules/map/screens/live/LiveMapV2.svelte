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
	import {Geometry} from 'geojson';
	import i18n from '../../../../i18n'
	import {getQueryStringSelection, QueryStringSelection} from '../../../core_service/query_string_selection_load';
	import {onMount} from 'svelte';
	import {PositionEntity} from '@utm-entities/position';
	import io from 'socket.io-client';
	import CModal from '@tokyo/gui/CModal.svelte';
	import {CModalVariant} from '@tokyo/gui/CModal';

	interface Telemetry {
		timestamp: number;
		lat: number;
		lon: number;
		publicTelemetry: boolean;
		uvin: string;
		heading: number;
		altitudeAbs: number;
		altitudeRel: number;
		inAir: boolean;
		calculatedData: {
			groundElevationInMeters: number;
			elevationProviderAPI: string;
			altitudeAGLInMeters: number;
		};
		id: number;
	}

	//export let history: H.History;

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
	let vehiclePositions: Map<String, PositionEntity[]> = new Map();

	onMount(() => {
		const socket = io(env.core_api + '/public'); // TODO: use private if logged in
		socket.on('new-position', (position: PositionEntity) => {
			const id = position.gufi + position.uvin;
			let positionsOfOneVehicle = vehiclePositions.get(id) || [] as PositionEntity[];
			positionsOfOneVehicle = [...positionsOfOneVehicle, position];
			vehiclePositions = new Map(vehiclePositions).set(id, positionsOfOneVehicle);
		});

		socket.on('new-telemetry', (telemetry: Telemetry) => {
			// TODO: this is temporal, as telemetry is not a real entity
			const id = telemetry.uvin;
			let positionsOfOneVehicle = vehiclePositions.get(id) || [];
			const pseudoPosition = new PositionEntity({
				id: new Date().getTime(),
				gufi: 'pseudo',
				uvin: telemetry.uvin,
				location: {
					type: 'Point',
					coordinates: [telemetry.lat, telemetry.lon]
				},
				time_sent: new Date(telemetry.timestamp),
				heading: telemetry.heading,
				altitude_gps: telemetry.altitudeRel,
			});
			console.log('pseudoPosition', pseudoPosition, telemetry);

			positionsOfOneVehicle = [...positionsOfOneVehicle, pseudoPosition];
			vehiclePositions = new Map(vehiclePositions).set(id, positionsOfOneVehicle);
		});
		return () => {
			socket.disconnect();
		};
	})

	// Entity selection logic
	let selected: QueryStringSelection = getQueryStringSelection();

	function onPick(pick: Partial<TokyoPick>) {
		const {type, id, volume} = pick;
		if (!id) {
			selected = null;
		} else if (type === PickableType.Operation && volume === undefined) {
			selected = null
		} else {
			selected = {type, id, volume};
		}
	}

	function isSelectedOfType(type: PickableType) {
		return selected?.type === type;
	}

	$: selectedOperation = selected?.type === PickableType.Operation ? operations.find(op => op.gufi === selected?.id) : null;
	$: idOperation = selected?.type === PickableType.Operation ? selected.id : null;
	$: idVolume = selected?.volume;


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

	// Map props

	$: isLoading = $query.isLoading;
	$: isError = !isLoading && ($query.isError || (idOperation && !selectedOperation));
	$: liveMapViewsProps = {
		operations,
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

<Dashboard canMenuOpen={!!selected} {isLoading}>
	<slot slot="menu">
		{#if selected}
			{#if isSelectedOfType(PickableType.Operation) && selectedOperation}
				<!-- TODO: Do it how it should be done
				<ViewOperationDetails gufi={selected.id}/> -->
				<h1>{i18n.t('Operation')}</h1>
				<OperationDetails operation={selectedOperation}/>
			{/if}
		{/if}
	</slot>
	<LiveMapView {...liveMapViewsProps} on:picked={(event) => onPick(event.detail)}/>
</Dashboard>

{#if isError}
	<CModal
			title={i18n.t('There is no operation with the specified id')}
			variant={CModalVariant.ERROR}
			closeText={i18n.t('Close') || 'Close'}
			on:close={() => window.location.href = window.location.origin + '/map'}>
		<!-- TODO: Update this call when using a Svelte router -->
		{i18n.t("Please check that no characters are missing from the URL and try again")}
	</CModal>
{/if}
