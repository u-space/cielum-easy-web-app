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
import { motion } from 'framer-motion';
import { useQueryString } from '../../../../utils';

const LiveMapView = reactify(LiveMapViewSvelte);

const PickContainer = styled.div`
	position: absolute;
	bottom: 1rem;
	right: 1rem;
	z-index: 191919;
`;

const PickWarning = styled.div`
	position: absolute;
	bottom: 1rem;
	left: 1rem;
	z-index: 191919;
	font-size: 2rem;
	background-color: var(--ramen-600);
	color: var(--mirai-50);
`;

const PointedAtSummary = styled.div`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translateX(-50%) translateY(-50%);
	background-color: var(--primary-900);
	padding: var(--spacing-2);
	border-radius: var(--radius-l);
	color: var(--mirai-50);
	font-size: 1.5rem;
	z-index: 212121;
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
	const queryString = useQueryString();
	const isPrevious = queryString.get('is-previous');

	const [latestHovered, setLatestHovered] = useState<string | null>(null);
	const [latestHoveredPosition, setLatestHoveredPosition] = useState<[number, number] | null>(
		null
	);
	const [pointerSummaryOpacity, setPointerSummaryOpacity] = useState(0);

	const selected = useMemo(
		() => ({ ...operationSelection, ...gzSelection, ...rfvSelection, ...uvrSelection }),
		[gzSelection, operationSelection, rfvSelection, uvrSelection]
	);
	const { positionsAsArray: positions } = usePositions();
	const { pickModalProps, onPick, pickedIds } = usePickElements();
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

	useEffect(() => {
		if (isPrevious) {
			onPick([]);
		}
	}, [isPrevious]);

	const onVehicleClick = (vehicle: PositionEntity[]) => {
		return () => {
			history.push(`/map?uvin=${vehicle[0].uvin}&gufi=${vehicle[0].gufi}`);
			return true;
		};
	};
	const liveMapViewProps: LiveMapViewProps = {
		operations: [],
		geographicalZones: isShowingGeographicalZones || gz ? queryGeographicalZones.items : [],
		rfvs: queryRfvs.rfvs,
		uvrs: isShowingUvrs ? queryUvrs.uvrs : uvr ? [uvr] : [],
		vehicles: positions,
		handlers: {
			vehicleClick: onVehicleClick,
			pick: onPick,
			hover: (info, pickingEvent) => {
				if (info.layer?.props) {
					// The name is the last part of the layer id, after the last |
					const name = info.layer.props.id.split('|').pop();
					if (name) {
						setLatestHovered(name);
						setLatestHoveredPosition([pickingEvent.center.x, pickingEvent.center.y]);
						setPointerSummaryOpacity(0.5);
					}
				}
				return true;
			}
		},
		pickedIds,
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
			onMouseMove={(event) => {
				// Calculate the difference between the mouse position and the latest hovered position
				const diff = [
					event.clientX - (latestHoveredPosition ? latestHoveredPosition[0] : 0),
					event.clientY - (latestHoveredPosition ? latestHoveredPosition[1] : 0)
				];
				// If the difference is greater than 10px, hide the pointer summary
				if (pointerSummaryOpacity === 0.5) {
					const opacity = Math.abs(diff[0]) > 100 || Math.abs(diff[1]) > 100 ? 0 : 0.5;
					setPointerSummaryOpacity(opacity);
				}
			}}
		>
			{latestHovered && (
				<PointedAtSummary style={{ opacity: pointerSummaryOpacity }}>
					{latestHovered}
				</PointedAtSummary>
			)}
			{pickModalProps && (
				<>
					<PickWarning>{t('Showing only clicked zones')}</PickWarning>
					<PickContainer>
						<PModal {...pickModalProps} />
					</PickContainer>
				</>
			)}
			<LiveMapView {...liveMapViewProps} />
		</MapLayout>
	);
};

export default LiveMap;
