import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { reactify } from 'svelte-preprocess-react';
import MapLayout from '../../../../commons/layouts/MapLayout';

import { PFullModalProps } from '@pcomponents/PFullModal';
import { useTokyo } from '@tokyo/TokyoStore';
import { PositionEntity } from '@utm-entities/position';
import { useEffect, useMemo, useState } from 'react';
import {
	useQueryOperations,
	useSelectedOperationAndVolume
} from '../../../core_service/operation/hooks';
import { usePositions } from '../../../core_service/position/hooks';
import useQueryRfvs, { useSelectedRfv } from '../../../core_service/rfv/hooks';
import useQueryUvrs, { useSelectedUvr } from '../../../core_service/uvr/hooks';
import {
	useQueryGeographicalZones,
	useSelectedGeographicalZone
} from '../../../flight_request_service/geographical_zone/hooks';
import Contextual from '../../components/Contextual';
import Menu from '../../components/Menu';
import usePickElements from '../../hooks';
import LiveMapViewSvelte from './LiveMapView.svelte';
import { LiveMapViewProps } from './LiveMapViewProps';
import PModal from '@pcomponents/PModal';
import styled from 'styled-components';

const LiveMapView = reactify(LiveMapViewSvelte);

const PickContainer = styled.div`
	position: absolute;
	bottom: 1rem;
	right: 1rem;
	z-index: 191919;
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
	const { volume, selected: operationSelection } = useSelectedOperationAndVolume();
	const { gz, selected: gzSelection } = useSelectedGeographicalZone();
	const { rfv, selected: rfvSelection } = useSelectedRfv();
	const { uvr, selected: uvrSelection } = useSelectedUvr();

	const selected = useMemo(
		() => ({ ...operationSelection, ...gzSelection, ...rfvSelection, ...uvrSelection }),
		[gzSelection, operationSelection, rfvSelection, uvrSelection]
	);
	const { positionsAsArray: positions } = usePositions();
	const { pickModalProps, onPick } = usePickElements();
	const [isShowingGeographicalZones, setShowingGeographicalZonesFlag] = useState(true);
	const [isShowingUvrs, setShowingUvrsFlag] = useState(false);

	useEffect(() => {
		if (volume) {
			tokyo.flyToCenterOfGeometry(volume.operation_geography);
		}
	}, [volume]);

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

	const onVehicleClick = (vehicle: PositionEntity[]) => {
		return () => {
			history.push(`/map?uvin=${vehicle[0].uvin}&gufi=${vehicle[0].gufi}`);
			return true;
		};
	};
	const liveMapViewProps: LiveMapViewProps = {
		operations: queryOperations.shownOperations,
		geographicalZones: isShowingGeographicalZones || gz ? queryGeographicalZones.items : [],
		rfvs: queryRfvs.rfvs,
		uvrs: isShowingUvrs ? queryUvrs.uvrs : uvr ? [uvr] : [],
		vehicles: positions,
		handlers: {
			vehicleClick: onVehicleClick,
			pick: onPick
		},
		selected
	};

	return (
		<MapLayout
			isLoading={{ main: queryOperations.isLoading }}
			statusOverlay={
				isShowingGeographicalZones && queryGeographicalZones.statusMessage
					? {
							text: queryGeographicalZones.statusMessage
					  }
					: undefined
			}
			menu={
				<Menu
					setShowingGeographicalZonesFlag={setShowingGeographicalZonesFlag}
					isShowingGeographicalZones={isShowingGeographicalZones}
					setShowingUvrsFlag={setShowingUvrsFlag}
					isShowingUvrs={isShowingUvrs}
				/>
			}
			contextual={<Contextual />}
		>
			{pickModalProps && (
				<PickContainer>
					<PModal {...pickModalProps} />
				</PickContainer>
			)}
			<LiveMapView {...liveMapViewProps} />
		</MapLayout>
	);
};

export default LiveMap;
