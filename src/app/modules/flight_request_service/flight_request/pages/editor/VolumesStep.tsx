import PButton, { PButtonSize } from '@pcomponents/PButton';
import PDateInput from '@pcomponents/PDateInput';
import PDateRangeInput from '@pcomponents/PDateRangeInput';
import { PModalType } from '@pcomponents/PModal';
import PNumberInput from '@pcomponents/PNumberInput';
import PTimeInput from '@pcomponents/PTimeInput';
import { Polygon } from 'geojson';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const ONE_VOLUME_PER_DAY = false;

const EditorMapView = reactify(EditorMapViewSvelte);
interface VolumesStepProps {
	polygon: Polygon;
	nextStep: () => void;
	flightRequest: FlightRequestEntity;
	setPolygon: (polygon: Polygon) => void;
	modalProps: PFullModalProps | undefined;
	setModalProps: (modalProps: PFullModalProps | undefined) => void;
}

// const function useIsOnNight()

const VolumesStep = (props: VolumesStepProps) => {
	const { polygon, nextStep, flightRequest, setPolygon, modalProps, setModalProps } = props;

	// const [startDate, setStartDate] = useState<Date | null>(null);
	// const [endDate, setEndDate] = useState<Date | null>(null);
	const { sunrise, fetchSunrise, isFetchingSunrise } = useSunrise();
	const [isOnNith, setIsOnNight] = useState<boolean>(false);
	const [dateTimeChange, setDateTimeChange] = useState<boolean>(false);

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

	useEffect(() => {
		console.log('isOnNight', isOnNith);
		console.log('polygon', polygon);
		if (polygon && flightRequest.volumes.length > 0) {
			for (let i = 0; i < flightRequest.volumes.length; i++) {
				console.log(
					`flightRequest.volumes[i].effective_time_begin:`,
					flightRequest.volumes[i].effective_time_begin
				);
				if (flightRequest.volumes[i].effective_time_begin) {
					const start = new Date(flightRequest.volumes[i].effective_time_begin || '');
					// const end = new Date(flightRequest.volumes[i].effective_time_end || "");
					const position = polygon.coordinates[0]; //flightRequest.volumes[0].operation_geography?.coordinates[0];
					console.log(
						`flightRequest.volumes:${JSON.stringify(flightRequest.volumes, null, 2)}`
					);
					console.log(`start:${start} position:${position}`);
					if (position) {
						fetchSunrise(
							start.toISOString().split('T')[0],
							position[0][0],
							position[0][1]
						);
					}
				}
			}
		}
	}, [dateTimeChange]);

	useEffect(() => {
		if (sunrise) {
			console.log('sunrise', sunrise);
			const volumenes = flightRequest.volumes.filter((f) => f.ordinal === 0);
			if (
				volumenes.length > 0 &&
				volumenes[0].effective_time_begin &&
				volumenes[0].effective_time_end
			) {
				console.log('start:', volumenes[0].effective_time_begin);
				console.log('end:', volumenes[0].effective_time_end);
				const start = new Date(volumenes[0].effective_time_begin);
				const end = new Date(volumenes[0].effective_time_end);
				const sunriseDate = new Date(start);
				setDateTime(sunriseDate, sunrise.sunrise);
				const sunsetDate = new Date(start);
				setDateTime(sunsetDate, sunrise.sunset);

				// if (start && end) {
				console.log(
					`${sunriseDate.toLocaleString()} > ${start.toLocaleString()} = ${
						sunriseDate < start
					}`
				);
				console.log(
					`${end.toLocaleString()} > ${sunsetDate.toLocaleString()} = ${end < sunsetDate}`
				);
				if (sunriseDate < start && start < end && end < sunsetDate) {
					setIsOnNight(false);
				} else {
					setIsOnNight(true);
				}
			}
		}
	}, [sunrise]);

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
				if (ONE_VOLUME_PER_DAY) {
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
				} else {
					validateDatesTimeVolumes(flightRequest, start.current, end.current);
					const newVolume = new OperationVolume();
					newVolume.set('ordinal', flightRequest.volumes.length - 1);
					const startDate = start.current;
					const endDate = end.current;
					newVolume.set('max_altitude', maxAltitude);
					newVolume.set('effective_time_begin', startDate);
					newVolume.set('effective_time_end', endDate);
					flightRequest.volumes.push(newVolume);
				}
				setDateTimeChange(!dateTimeChange);
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
						<p>Test sunrise</p>
						{sunrise && <pre>${JSON.stringify(sunrise, null, 2)}</pre>}
						<pre>is fetching {String(isFetchingSunrise)}</pre>
						<pre>is en noche {String(isOnNith)}</pre>
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

function validateDatesTimeVolumes(
	flightRequest: FlightRequestEntity,
	start: Date,
	end: Date
): boolean {
	flightRequest.volumes.forEach((volume) => {
		if (volume.effective_time_begin !== null && volume.effective_time_end !== null) {
			if (
				volume.effective_time_begin > volume.effective_time_end ||
				volume.effective_time_begin < start ||
				volume.effective_time_end > end
			) {
				return false;
			}
			return true;
		}
		return false;
	});
	return true;
}

interface SunriseData {
	sunrise: SunriseSunsetResults | null;
	fetchSunrise: (date: string, latitude: number, longitude: number) => Promise<void>;
	isFetchingSunrise: boolean;
}

export interface SunriseSunsetResults {
	sunrise: string;
	sunset: string;
	solar_noon: string;
	day_length: string;
	civil_twilight_begin: string;
	civil_twilight_end: string;
	nautical_twilight_begin: string;
	nautical_twilight_end: string;
	astronomical_twilight_begin: string;
	astronomical_twilight_end: string;
}

export interface SunriseSunsetResponse {
	results: SunriseSunsetResults;
	status: string;
}

export const useSunrise = (): SunriseData => {
	const [sunrise, setSunrise] = useState<SunriseSunsetResults | null>(null);
	const [isFetchingSunrise, setIsFetchingSunrise] = useState<boolean>(false);

	const fetchSunrise = async (date: string, latitude: number, longitude: number) => {
		setIsFetchingSunrise(true);
		try {
			const apiStr = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&tzid=America/Montevideo`;
			console.log(apiStr);
			const response = await fetch(apiStr);
			const data: SunriseSunsetResponse = await response.json();

			if (data.status === 'OK') {
				setSunrise(data.results);
			} else {
				setSunrise(null);
			}
		} catch (error) {
			console.error('Error fetching sunrise data:', error);
			setSunrise(null);
		} finally {
			setIsFetchingSunrise(false);
		}
	};

	return { sunrise, fetchSunrise, isFetchingSunrise };
};

const setDateTime = (d: Date, timeStr: string) => {
	const [time, period] = timeStr.split(' ');
	// eslint-disable-next-line prefer-const
	let [hours, minutes, seconds] = time.split(':').map(Number);
	if (period.toLowerCase() === 'pm' && hours !== 12) {
		hours += 12;
	} else if (period.toLowerCase() === 'am' && hours === 12) {
		hours = 0;
	}
	d.setHours(hours, minutes, seconds, 0);
};
