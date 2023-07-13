/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { usePositions, useSimulatedPositions } from '../../../core_service/position/hooks';
import useQueryRfvs, { useSelectedRfv } from '../../../core_service/rfv/hooks';
import useQueryUvrs, { useSelectedUvr } from '../../../core_service/uvr/hooks';
import {
	useQueryGeographicalZones,
	useSelectedGeographicalZone
} from '../../../flight_request_service/geographical_zone/hooks';
import Contextual from '../../components/Contextual';
import Menu from '../../components/Menu';
import turf from 'turf';
import usePickElements from '../../hooks';
import LiveMapViewSvelte from './LiveMapView.svelte';
import { LiveMapViewProps } from './LiveMapViewProps';
import PModal from '@pcomponents/PModal';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryString } from '../../../../utils';
import { useAuthStore } from '../../../auth/store';
import { selectEntity } from '../../utils';
import { TokyoPick } from '@tokyo/TokyoTypes';
import { OperationEntity, OperationVolume } from '@utm-entities/operation';
import OperationInfosSvelte from './OperationInfos.svelte';
import { onOff } from '@pcomponents/anims';
import { useOperationStore } from '../../../core_service/operation/store';

const LiveMapView = reactify(LiveMapViewSvelte);
const OperationInfos = reactify(OperationInfosSvelte);

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

const OverEverything = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10;
`;

const UnderMap = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: black;
`;

const OperationInfo = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: var(--primary-700);
	color: var(--white-100);
`;

const VolumeInfo = styled.div`
	display: flex;
	flex-direction: column;
`;

const PublicMapTemporalDemo = () => {
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
	const { volume, selected: operationSelection, operation } = useSelectedOperationAndVolume();
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
	const { pickModalProps, pickedIds } = usePickElements();
	const [isShowingGeographicalZones, setShowingGeographicalZonesFlag] = useState(false);
	const [isShowingUvrs, setShowingUvrsFlag] = useState(false);

	const samplePolygon = [
		[
			[0, 0],
			[0, 1],
			[1, 1],
			[1, 0],
			[0, 0]
		]
	];

	/* const simulatedQuery = useSimulatedPositions(
		operation?.gufi || '',
		operation?.uas_registrations[0].uvin || '',
		turf.center(turf.polygon(volume?.operation_geography?.coordinates || samplePolygon) as any)
			.geometry.coordinates[1],
		turf.center(turf.polygon(volume?.operation_geography?.coordinates || samplePolygon) as any)
			.geometry.coordinates[0]
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
		if (volume) {
			tokyo.flyToCenterOfGeometry(volume.operation_geography);
			setExpanded(false);
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

	const onPick = (elements: TokyoPick[]) => {
		if (elements.length > 0) {
			selectEntity(elements[0], history);
		}
	};

	const operations: OperationEntity[] = useMemo(() => {
		if (queryOperations.operations) {
			return queryOperations.operations.map(
				(operation: OperationEntity) =>
					new OperationEntity({
						...operation,
						// sort operation volumes by ordinal
						operation_volumes: operation.operation_volumes.sort(
							(a: OperationVolume, b: OperationVolume) => a.ordinal - b.ordinal
						)
					})
			);
		}
		return [];
	}, [queryOperations.operations]);

	const liveMapViewProps: LiveMapViewProps = {
		operations,
		geographicalZones: isShowingGeographicalZones ? queryGeographicalZones.items : [],
		rfvs: queryRfvs.rfvs,
		uvrs: isShowingUvrs ? queryUvrs.uvrs : uvr ? [uvr] : [],
		vehicles: positions,
		handlers: {
			vehicleClick: onVehicleClick,
			pick: onPick
		},
		pickedIds,
		selected
	};

	const [expanded, setExpanded] = useState(false);

	return (
		<OverEverything>
			<UnderMap />
			<div
				style={{
					width: '100%',
					height: expanded ? 'calc(100dvh - 16rem)' : '100%',
					transition: 'height 0.1s'
				}}
			>
				<LiveMapView {...liveMapViewProps} />
			</div>
			{operation && (
				<OperationInfos
					key={operation.gufi + operationSelection.volume}
					operation={operation}
					indexSelectedVolume={Number(operationSelection.volume)}
					onExpand={() => setExpanded(true)}
					onCollapse={() => setExpanded(false)}
					// onPrevious, replace current volume in url with previous volume
					// for instance, /public/map?operation=7488c6f5-9c12-4938-8391-671c556be48b&volume=5
					// should be replaced with /public/map?operation=7488c6f5-9c12-4938-8391-671c556be48b&volume=4
					onPrevious={() =>
						history.push(
							`/public/map?operation=${operation.gufi}&volume=${
								Number(operationSelection.volume) - 1
							}`
						)
					}
					onNext={() =>
						history.push(
							`/public/map?operation=${operation.gufi}&volume=${
								Number(operationSelection.volume) + 1
							}`
						)
					}
				/>
			)}
		</OverEverything>
	);
	/*
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
	);*/
};

export default PublicMapTemporalDemo;
