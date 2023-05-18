import MapLayout from '../../../../commons/layouts/MapLayout';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { reactify } from 'svelte-preprocess-react';

import {
	useQueryOperations,
	useSelectedOperationAndVolume
} from '../../../core_service/operation/hooks';
import {
	useQueryGeographicalZones,
	useSelectedGeographicalZone
} from '../../../flight_request_service/geographical_zone/hooks';
import useQueryRfvs, { useSelectedRfv } from '../../../core_service/rfv/hooks';
import useQueryUvrs, { useSelectedUvr } from '../../../core_service/uvr/hooks';
import { useTokyo } from '@tokyo/TokyoStore';
import { usePositions } from '../../../core_service/position/hooks';
import { useEffect, useMemo, useState } from 'react';
import usePickElements from '../../hooks';
import { PositionEntity } from '@utm-entities/position';
import Menu from '../../components/Menu';
import Contextual from '../../components/Contextual';
import LiveMapViewSvelte from './LiveMapView.svelte';
import { LiveMapViewProps } from './LiveMapViewProps';
import { PFullModalProps } from '@pcomponents/PFullModal';

const LiveMapView = reactify(LiveMapViewSvelte);

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
	const [isShowingGeographicalZones, setShowingGeographicalZonesFlag] = useState(false);
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

	const pickFullModalProps = useMemo(() => {
		const fullModalProps: PFullModalProps = {
			content: '',
			title: '',
			...pickModalProps,
			isVisible: !!pickModalProps
		};
		return fullModalProps;
	}, [pickModalProps]);

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
			modal={pickFullModalProps}
		>
			<LiveMapView {...liveMapViewProps} />
		</MapLayout>
	);
};

export default LiveMap;
