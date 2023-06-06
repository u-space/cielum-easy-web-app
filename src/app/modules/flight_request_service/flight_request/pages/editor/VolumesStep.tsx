import { Divider } from '@blueprintjs/core';
import PButton, { PButtonSize } from '@pcomponents/PButton';
import PDateInput from '@pcomponents/PDateInput';
import PDateRangeInput from '@pcomponents/PDateRangeInput';
import { PModalType } from '@pcomponents/PModal';
import PNumberInput from '@pcomponents/PNumberInput';
import PTimeInput from '@pcomponents/PTimeInput';
import { Polygon } from 'geojson';
import { observer } from 'mobx-react-lite';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { useQueryGeographicalZones } from '../../../geographical_zone/hooks';
import usePickElements from '../../../../map/hooks';
import { OperationVolume } from '@utm-entities/operation';
import MapLayout from '../../../../../commons/layouts/MapLayout';
import CardGroup from '../../../../../commons/layouts/dashboard/menu/CardGroup';
import MapViewModeSwitch from '../../../../map/components/MapViewModeSwitch';
import InfoFlightRequest from '../../components/InfoFlightRequest';
import { EditorMapViewProps } from '../../../../map/screens/editor/EditorMapViewProps';
import { reactify } from 'svelte-preprocess-react';
import EditorMapViewSvelte from '../../../../map/screens/editor/EditorMapView.svelte';
import { PFullModalProps } from '@pcomponents/PFullModal';
import FullParentOverlayBlock, {
	FullBlockType
} from '../../../../../commons/components/FullParentOverlayBlock';

const EditorMapView = reactify(EditorMapViewSvelte);

interface VolumesStepProps {
	nextStep: () => void;
	flightRequest: FlightRequestEntity;
	setPolygon: (polygon: Polygon | undefined) => void;
	modalProps: PFullModalProps | undefined;
	setModalProps: (modalProps: PFullModalProps | undefined) => void;
}

const VolumesStep = (props: VolumesStepProps) => {
	const { nextStep, flightRequest, setPolygon, modalProps, setModalProps } = props;

	const start = useRef(setHoursAndReturnDate(addDays(new Date(), 10), 9, 0));
	const end = useRef(
		setHoursAndReturnDate(addDays(new Date(new Date().getTime() + 60 * 60 * 1000), 10), 14, 0)
	);

	const { t } = useTranslation();

	const [maxAltitude, setMaxAltitude] = useState<number>(120);
	const [isBlockingCenter, setBlockingCenterFlag] = useState<boolean>(false);

	const queryGeographicalZones = useQueryGeographicalZones(true);
	const { pickModalProps, onPick } = usePickElements();

	const onPolygonsUpdated = useCallback((polygons: Polygon[]) => {
		setPolygon(polygons[0]);
	}, []);

	const getUserSelectIntervalModalProps = (): PFullModalProps => ({
		isVisible: true,
		type: PModalType.INFORMATION,
		title: t('Select the time interval'),
		content: (
			<>
				{t('Start and end dates')}
				<PDateRangeInput
					value={[start.current, end.current]}
					onChange={(value) => {
						if (value[0]) {
							start.current.setFullYear(value[0].getFullYear());
							start.current.setMonth(value[0].getMonth());
							start.current.setDate(value[0].getDate());
						}
						if (value[1]) {
							end.current.setFullYear(value[1].getFullYear());
							end.current.setMonth(value[1].getMonth());
							end.current.setDate(value[1].getDate());
						}
					}}
				/>
				<PTimeInput
					defaultValue={start.current}
					onChange={(value: any) => {
						if (value) {
							start.current = setHoursMinutesSeconds(value, start.current);
						}
					}}
					explanation={''}
					id={'Start_Time'}
					labelInfo={''}
					label={t('Start Time')}
					isDarkVariant
				/>
				<PTimeInput
					defaultValue={end.current}
					onChange={(value: Date) => {
						if (value) {
							end.current = setHoursMinutesSeconds(value, end.current);
						}
					}}
					explanation={''}
					id={'End_Time'}
					labelInfo={''}
					label={t('End Time')}
					isDarkVariant
				/>
			</>
		),
		primary: {
			text: t('Save'),
			onClick: () => {
				// For each day in the range, create a new volume
				// with the start and end time
				getDatesBetween(start.current, end.current).forEach((date) => {
					const newVolume = new OperationVolume(flightRequest.volumes.length - 1);
					const startDate = setHoursMinutesSeconds(start.current, new Date(date));
					const endDate = setHoursMinutesSeconds(end.current, new Date(date));
					newVolume.set('max_altitude', maxAltitude);
					newVolume.set('effective_time_begin', startDate);
					newVolume.set('effective_time_end', endDate);
					flightRequest.volumes.push(newVolume);
				});
				setModalProps(undefined);
			}
		},
		secondary: {
			text: 'Cancelar',
			onClick: () => {
				setModalProps(undefined);
			}
		}
	});

	const getTimeIntervalModalProps = () => ({
		isVisible: true,
		type: PModalType.INFORMATION,
		title: t('Select the time interval'),
		content: (
			<>
				<PDateInput
					id="start-date"
					isTime
					label={'Fecha y hora de inicio'}
					labelInfo={''}
					explanation={''}
					placeholder={''}
					defaultValue={start.current}
					isDarkVariant
					onChange={(value: Date) => {
						start.current = value;
					}}
				/>
				<PDateInput
					id="end-date"
					isTime
					label={'Fecha y hora de fin'}
					labelInfo={''}
					explanation={''}
					placeholder={''}
					defaultValue={end.current}
					isDarkVariant
					onChange={(value: Date) => {
						end.current = value;
					}}
				/>
			</>
		),
		primary: {
			onClick: () => {
				if (start.current >= end.current) {
					alert('La hora de inicio debe ser menor que la hora de fin');
					return;
				}
				if (start.current < addDays(new Date(), 9)) {
					alert('La fecha de inicio debe ser mayor a 10 dias de la fecha actual');
					return;
				}
				// The end date should be on the same day as the start date
				if (start.current.getDate() !== end.current.getDate()) {
					alert('La fecha de fin debe ser el mismo día que la fecha de inicio');
					return;
				}
				const newVolume = new OperationVolume(flightRequest.volumes.length - 1);
				newVolume.set('max_altitude', maxAltitude);
				newVolume.set('effective_time_begin', start.current);
				newVolume.set('effective_time_end', end.current);
				flightRequest.volumes.push(newVolume);
				setModalProps(undefined);
			},
			text: t('Save')
		},
		secondary: {
			text: 'Cancelar',
			onClick: () => {
				setModalProps(undefined);
			}
		}
	});

	const getUserSelectTimeRangeModalProps = (): PFullModalProps => ({
		isVisible: true,
		type: PModalType.INFORMATION,
		title: t('Select the time interval'),
		content: (
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<PButton
					onClick={() => {
						setModalProps(getTimeIntervalModalProps());
					}}
					size={PButtonSize.MEDIUM}
					style={{
						marginRight: '1rem',
						width: '100px',
						height: '100px',
						textAlign: 'center'
					}}
				>
					{t('Select date and time range')}
				</PButton>
				<PButton
					onClick={() => {
						setModalProps(getUserSelectIntervalModalProps());
					}}
					size={PButtonSize.MEDIUM}
					style={{
						marginRight: '1rem',
						width: '100px',
						height: '100px',
						textAlign: 'center'
					}}
				>
					{t('Select time interval')}
				</PButton>
			</div>
		),
		secondary: {
			text: t('Cancel'),
			onClick: () => {
				setModalProps(undefined);
			}
		}
	});

	const editorMapViewProps: EditorMapViewProps = {
		handlers: { edit: onPolygonsUpdated, pick: onPick },
		editingSingleVolume: true,
		defaultPolygons: [],
		geographicalZones: queryGeographicalZones.items
	};

	return (
		<MapLayout
			statusOverlay={{
				text: `### ${t('You are in EDITOR MODE')} \n ${
					queryGeographicalZones.statusMessage ?? ''
				}`
			}}
			isBlockingCenter={isBlockingCenter}
			contextual={
				<>
					{flightRequest.volumes[0] ? (
						<CardGroup
							header={t('Fill in volume information')}
							style={{ maxHeight: '50vh', overflowY: 'auto' }}
						>
							<PNumberInput
								id="operation-height"
								label={t('Maximum altitude')}
								defaultValue={flightRequest.volumes[0]?.max_altitude ?? 120}
								onChange={(value) => {
									setMaxAltitude(value);
									flightRequest.volumes.forEach((volume) => {
										volume.set('max_altitude', value);
									});
								}}
							/>
							<Divider dir="horizontal" />
							<p>{t('Intervalos de tiempo')}</p>
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '1rem',
									justifyContent: 'center'
								}}
							>
								<PButton
									size={PButtonSize.SMALL}
									icon="plus"
									id={'editor-flightRequest-add-time-interval'}
									onClick={() => {
										setModalProps(getUserSelectTimeRangeModalProps());
									}}
								/>
								{flightRequest.volumes.map((volume, index) => {
									if (
										volume.effective_time_begin !== null &&
										volume.effective_time_end !== null
									) {
										return (
											<div
												key={volume.ordinal}
												style={{
													display: 'flex',
													justifyContent: 'center'
												}}
											>
												{volume.effective_time_begin.toLocaleString()} -{' '}
												{volume.effective_time_end.toLocaleString()}
												<PButton
													size={PButtonSize.SMALL}
													icon="minus"
													onClick={() => {
														if (flightRequest.volumes.length === 1) {
															flightRequest.volumes[0].set(
																'effective_time_begin',
																null
															);
															flightRequest.volumes[0].set(
																'effective_time_end',
																null
															);
														} else {
															flightRequest.volumes.splice(index, 1);
														}
													}}
												/>
											</div>
										);
									} else {
										return null;
									}
								})}
							</div>
						</CardGroup>
					) : null}
					<MapViewModeSwitch />
				</>
			}
			menu={
				<InfoFlightRequest
					{...{
						flightRequest,
						isEditingExisting: false,
						volumeProps: [],
						setBlockingCenter: setBlockingCenterFlag,
						nextStep
					}}
				/>
			}
			modal={
				modalProps || (pickModalProps ? { ...pickModalProps, isVisible: true } : undefined)
			}
		>
			<EditorMapView {...editorMapViewProps} />
		</MapLayout>
	);
};

// This function given 2 dates, returns an array of dates between them
const getDatesBetween = (startDate: Date, endDate: Date) => {
	const dates = [];
	const theDate = new Date(startDate);
	while (theDate <= endDate) {
		dates.push(new Date(theDate));
		theDate.setDate(theDate.getDate() + 1);
	}
	return dates;
};
// This function given 2 dates set the hour minutes and seconds of the secondone to the first one
const setHoursMinutesSeconds = (date: Date, dateToSet: Date) => {
	dateToSet.setHours(date.getHours());
	dateToSet.setMinutes(date.getMinutes());
	dateToSet.setSeconds(date.getSeconds());
	return dateToSet;
};

// This function add days to a date
const addDays = (date: Date, days: number) => {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
};

const setHoursAndReturnDate = (date: Date, hours: number, minutes: number) => {
	date.setHours(hours);
	date.setMinutes(minutes);
	return date;
};

export default observer(VolumesStep);
