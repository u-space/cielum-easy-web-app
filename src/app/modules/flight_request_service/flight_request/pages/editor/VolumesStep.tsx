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
import MapLayout from '../../../../../commons/layouts/MapLayout';
import InfoFlightRequest from '../../components/InfoFlightRequest';
import { reactify } from 'svelte-preprocess-react';
import EditorMapViewSvelte from '../../../../map/screens/editor/EditorMapView.svelte';
import { PFullModalProps } from '@pcomponents/PFullModal';
import { EditMode, EditOptions } from '@tokyo/types';
import { OperationVolume } from '@utm-entities/v2/model/operation_volume';

const EditorMapView = reactify(EditorMapViewSvelte);
interface VolumesStepProps {
	polygon: Polygon;
	nextStep: () => void;
	flightRequest: FlightRequestEntity;
	setPolygon: (polygon: Polygon) => void;
	modalProps: PFullModalProps | undefined;
	setModalProps: (modalProps: PFullModalProps | undefined) => void;
}

const VolumesStep = (props: VolumesStepProps) => {
	const { polygon, nextStep, flightRequest, setPolygon, modalProps, setModalProps } = props;

	const start = useRef(setHoursAndReturnDate(addDays(new Date(), 10), 9, 0));
	const end = useRef(
		setHoursAndReturnDate(addDays(new Date(new Date().getTime() + 60 * 60 * 1000), 10), 14, 0)
	);

	const { t } = useTranslation();

	const [maxAltitude, setMaxAltitude] = useState<number>(120);
	const [isBlockingCenter, setBlockingCenterFlag] = useState<boolean>(false);

	const queryGeographicalZones = useQueryGeographicalZones(true);

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
			text: t('Add'),
			onClick: () => {
				// For each day in the range, create a new volume
				// with the start and end time
				getDatesBetween(start.current, end.current).forEach((date) => {
					const newVolume = new OperationVolume();
					newVolume.set('ordinal', flightRequest.volumes.length - 1);
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

	const editOptions: EditOptions = {
		mode: EditMode.SINGLE,
		polygons: [polygon]
	};

	const timeOptions = {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	} as Intl.DateTimeFormatOptions;

	return (
		<MapLayout
			statusOverlay={{
				text: `### ${t('You are in EDITOR MODE')} `
			}}
			isBlockingCenter={isBlockingCenter}
			menu={
				<InfoFlightRequest
					{...{
						flightRequest,
						isEditingExisting: false,
						volumeProps: [],
						setBlockingCenter: setBlockingCenterFlag,
						nextStep
					}}
				>
					<div>
						<p>{t('Time intervals')}</p>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '1rem',
								justifyContent: 'center'
							}}
						>
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
											{volume.effective_time_begin.toLocaleString(
												[],
												timeOptions
											)}{' '}
											-{' '}
											{volume.effective_time_end.toLocaleString(
												[],
												timeOptions
											)}
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
							<PButton
								size={PButtonSize.SMALL}
								icon="plus"
								id={'editor-flightRequest-add-time-interval'}
								onClick={() => {
									setModalProps(getUserSelectIntervalModalProps());
								}}
							>
								{t('Add interval')}
							</PButton>
						</div>
					</div>
					<div>
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
					</div>
				</InfoFlightRequest>
			}
			modal={modalProps}
		>
			{/* eslint-disable @typescript-eslint/no-explicit-any */}
			<EditorMapView
				editOptions={editOptions}
				geographicalZones={queryGeographicalZones.items}
				onEdit={(event: any) => onPolygonsUpdated(event.detail)}
			/>
			<PButton
				style={{
					position: 'absolute',
					bottom: '1rem'
				}}
				size={PButtonSize.LARGE}
				onClick={() => {
					nextStep();
				}}
			>
				{t('Continue')}
			</PButton>
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
