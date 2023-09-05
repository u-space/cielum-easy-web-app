import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { reactify } from 'svelte-preprocess-react';
import MapLayout from '../../../../commons/layouts/MapLayout';
import { useTokyo } from '@tokyo/store';
import { PositionEntity } from '@utm-entities/position';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	useQueryOperations,
	useSelectedOperationAndVolume
} from '../../../core_service/operation/hooks';
import useQueryRfvs, { useSelectedRfv } from '../../../core_service/rfv/hooks';
import useQueryUvrs, { useSelectedUvr } from '../../../core_service/uvr/hooks';
import {
	useQueryGeographicalZones,
	useSelectedGeographicalZone
} from '../../../flight_request_service/geographical_zone/hooks';
import Contextual from '../../components/Contextual';
import Menu from '../../components/Menu';

import LiveMapViewSvelte from './LiveMapView.svelte';
import {
	LiveMapGeographicalZoneSelected,
	LiveMapOperationSelected,
	LiveMapRfvSelected,
	LiveMapSelectableType,
	LiveMapSelected,
	LiveMapUvrSelected,
	LiveMapViewProps
} from './LiveMapViewProps';
import styled from 'styled-components';
import { setCSSVariable, useQueryString } from '../../../../utils';
import env from '../../../../../vendor/environment/env';
import { TokyoPick } from '@tokyo/types';
import { usePositionStore } from '../../../core_service/position/store';
import { getCSSVariable } from '@pcomponents/utils';
import { Polygon } from 'geojson';
import PButton from '@pcomponents/PButton';
import { IconName } from '@blueprintjs/core';

const LiveMapView = reactify(LiveMapViewSvelte);

const ExtraRealtimeMapButtons = styled.div`
	position: absolute;
	bottom: 1rem;
	left: 1rem;
	right: 3rem;
	display: flex;
	justify-content: flex-start;
	gap: 0.5rem;
`;

const LiveMap = () => {
	const { t } = useTranslation();
	const history = useHistory();
	const queryOperations = useQueryOperations(true);
	const queryGeographicalZones = useQueryGeographicalZones(true);
	const queryRfvs = useQueryRfvs();
	const queryUvrs = useQueryUvrs(true);
	const isLoading =
		queryOperations.isLoading ||
		queryGeographicalZones.isLoading ||
		queryGeographicalZones.isFetching ||
		queryRfvs.isLoadingRfvs ||
		queryUvrs.isLoadingUvrs;

	const tokyo = useTokyo();
	const { volume, operation, selected: operationSelection } = useSelectedOperationAndVolume();
	const { gz, selected: gzSelection } = useSelectedGeographicalZone();
	const { rfv, selected: rfvSelection } = useSelectedRfv();
	const { uvr, selected: uvrSelection } = useSelectedUvr();
	const queryString = useQueryString();
	const isPrevious = queryString.get('is-previous');

	const selected: LiveMapSelected = useMemo(() => {
		if (operation) {
			return {
				type: LiveMapSelectableType.OPERATION,
				gufi: operation.gufi as string,
				volume: Number(operationSelection.volume)
			} as LiveMapOperationSelected;
		} else if (gz) {
			return {
				type: LiveMapSelectableType.GEOGRAPHICAL_ZONE,
				id: gz.id
			} as LiveMapGeographicalZoneSelected;
		} else if (rfv) {
			return {
				type: LiveMapSelectableType.RFV,
				id: rfv.id
			} as LiveMapRfvSelected;
		} else if (uvr) {
			return {
				type: LiveMapSelectableType.UVR,
				id: uvr.id
			} as LiveMapUvrSelected;
		} else {
			return null;
		}
	}, [gz, operationSelection, operation, rfv, uvr]);
	const positions = usePositionStore((state) => state.positions);
	const [isShowingGeographicalZones, setShowingGeographicalZonesFlag] = useState(true);
	const [isShowingUvrs, setShowingUvrsFlag] = useState(false);

	const redirectToPicked = useCallback(
		(pick: TokyoPick) => {
			const prev = history.location.pathname;
			history.push(
				pick.volume !== undefined
					? `/map?${pick.type}=${pick.id}&volume=${pick.volume}&prev=${prev}`
					: `/map?${pick.type}=${pick.id}&prev=${prev}`
			);
		},
		[history]
	);

	useEffect(() => {
		if (volume) {
			tokyo.flyToCenterOfGeometry(volume.operation_geography as Polygon); // This is a operation fetched from the backend
		}
	}, [volume]);

	/* const samplePolygon = [
		[
			[0, 0],
			[0, 1],
			[1, 1],
			[1, 0],
			[0, 0]
		]
	];

	const simulatedQuery = useSimulatedPositions(
		operation?.gufi || '',
		operation?.uas_registrations[0].uvin || '',
		center(polygon(volume?.operation_geography?.coordinates || samplePolygon) as any).geometry
			.coordinates[1],
		center(polygon(volume?.operation_geography?.coordinates || samplePolygon) as any).geometry
			.coordinates[0]
	);

	useEffect(() => {
		let interval: NodeJS.Timer;

		if (operation) {
			interval = setInterval(() => {
				simulatedQuery.refetch();
			}, 2000);
		}
		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [simulatedQuery, operation]); */

	useEffect(() => {
		if (gz) {
			tokyo.flyToCenterOfGeometry(gz.geography);
		}
	}, [gz]);

	useEffect(() => {
		if (uvr) {
			tokyo.flyToCenterOfGeometry(uvr.geography);
		}
	}, [uvr]);

	useEffect(() => {
		if (rfv) {
			tokyo.flyToCenterOfGeometry(rfv.geography);
		}
	}, [rfv]);

	useEffect(() => {
		if (!selected) {
			setCSSVariable('side-width', '0px');
		} else {
			setCSSVariable('side-width', getCSSVariable('side-width-default'));
		}
		return () => {
			setCSSVariable('side-width', getCSSVariable('side-width-default'));
		};
	}, [selected]);

	const operations = useMemo(() => {
		const operations = queryOperations.shownOperations;
		if (operation) {
			if (!operations.find((op) => op.gufi === operation.gufi)) {
				operations.push(operation);
			}
		}
		return operations;
	}, [queryOperations.shownOperations, operation]);

	const onVehicleClick = (vehicle: PositionEntity[]) => {
		return () => {
			history.push(`/map?uvin=${vehicle[0].uvin}&gufi=${vehicle[0].gufi}`);
			return true;
		};
	};
	const liveMapViewProps: LiveMapViewProps = {
		operations,
		geographicalZones: isShowingGeographicalZones || gz ? queryGeographicalZones.items : [],
		rfvs: queryRfvs.rfvs,
		uvrs: isShowingUvrs ? queryUvrs.uvrs : uvr ? [uvr] : [],
		vehiclePositions: positions || new Map(),
		t,
		controlsOptions: {
			geocoder: {
				enabled: true,
				geoapifyApiKey: env.API_keys.geoapify
			}
		},
		handlers: {
			vehicleClick: onVehicleClick
		},
		selected
	};

	return (
		<MapLayout
			isLoading={{ main: queryOperations.isLoading }}
			menu={
				<>
					<Menu
						setShowingGeographicalZonesFlag={setShowingGeographicalZonesFlag}
						isShowingGeographicalZones={isShowingGeographicalZones}
						setShowingUvrsFlag={setShowingUvrsFlag}
						isShowingUvrs={isShowingUvrs}
					/>
					<Contextual />
				</>
			}
		>
			<LiveMapView
				{...liveMapViewProps}
				onPicked={(e) => redirectToPicked((e as CustomEvent<TokyoPick>).detail)}
			/>
			{env.tenant.extras.realtime_map_buttons && (
				<ExtraRealtimeMapButtons>
					{env.tenant.extras.realtime_map_buttons.map((button) => (
						<PButton
							key={button.label}
							icon={(button.icon as IconName) || undefined}
							onClick={() => {
								history.push(button.path);
							}}
						>
							{t(button.label)}
						</PButton>
					))}
				</ExtraRealtimeMapButtons>
			)}
		</MapLayout>
	);
};

export default LiveMap;
