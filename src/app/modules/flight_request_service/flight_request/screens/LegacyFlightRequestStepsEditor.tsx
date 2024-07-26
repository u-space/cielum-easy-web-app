/* eslint-disable @typescript-eslint/no-explicit-any */
import { FlightCategory, FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { PFullModalProps } from '@pcomponents/PFullModal';
import { PModalType } from '@pcomponents/PModal';
import { OperationVolume } from '@utm-entities/v2/model/operation_volume';
import { Polygon } from 'geojson';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import i18n from '../../../../i18n';
import CoordinationsStep from '../pages/editor/CoordinationsStep';
import VolumesStep from '../pages/editor/VolumesStep';

export interface SubTotals {
	amount: number;
	reason: string;
}

enum FlightRequestEditorStep {
	VOLUME_AND_INFO,
	COORDINATIONS,
	INSURANCE_AND_PAYMENT
}

const LegacyFlightRequestStepsEditor = () => {
	const { t } = useTranslation();

	const params = useParams<{ polygon: string }>();
	const existingPolygon = JSON.parse(params.polygon) as Polygon;

	const [isOnNight, setIsOnNight] = useState<boolean>(false);
	const [polygon, setPolygon] = useState<Polygon>(existingPolygon);
	const [modalProps, setModalProps] = useState<PFullModalProps | undefined>();
	const flightRequest = useMemo(() => {
		const flightRequest = new FlightRequestEntity();
		const vol = new OperationVolume();
		vol.set('ordinal', -1);
		vol.set('effective_time_begin', null);
		vol.set('effective_time_end', null);
		vol.set('operation_geography', polygon);

		flightRequest.volumes = [vol];
		return flightRequest;
	}, []);

	const [zonesChecked, setZonesChecked] = useState<GeographicalZone[]>([]);

	const [step, setStep] = useState(FlightRequestEditorStep.VOLUME_AND_INFO);

	const zonesCheckedTotal = useMemo(() => {
		return zonesChecked.reduce((acc, zone) => acc + (zone.coordinator?.price ?? 0), 0);
	}, [zonesChecked]);
	const [total, setTotal] = useState<SubTotals[]>([]);

	useEffect(() => {
		const aux = [];
		aux.push({
			reason: t('Coordinations'),
			amount: zonesCheckedTotal
		});
		if (flightRequest.urban_flight) {
			aux.push({ reason: t('Coordination fee for flying in an urban area'), amount: 30 });
		}
		aux.push({ reason: t('Base fee'), amount: 20 });
		setTotal(aux);
	}, [zonesCheckedTotal, flightRequest.urban_flight, t]);

	const resetError = () => {
		setModalProps(undefined);
	};

	const _coordinationsStep = () => {
		flightRequest.volumes = flightRequest.volumes.slice(1);
		flightRequest.volumes.forEach((volume) => {
			if (polygon !== undefined) {
				volume.set('operation_geography', polygon);
			}
		});
		setStep(FlightRequestEditorStep.COORDINATIONS);
	};

	/* -- */
	const nextStep = () => {
		if (step === FlightRequestEditorStep.VOLUME_AND_INFO) {
			const errors = validateFlightRequest(flightRequest);
			if (errors.length > 0) {
				setModalProps({
					isVisible: true,
					type: PModalType.ERROR,
					title: 'Error',
					content: errors,
					primary: {
						onClick: resetError
					}
				});
				return;
			}
			if (polygon === undefined) {
				setModalProps({
					isVisible: true,
					type: PModalType.ERROR,
					title: t('Error'),
					content: t('Please draw a polygon to continue'),
					primary: {
						onClick: resetError
					}
				});
				return;
			}
			_coordinationsStep();
		} else if (step === FlightRequestEditorStep.COORDINATIONS) {
			flightRequest.setGeographicalZones(zonesChecked);
			setStep(FlightRequestEditorStep.INSURANCE_AND_PAYMENT);
		}
	};

	const previousStep = () => {
		if (step === FlightRequestEditorStep.COORDINATIONS) {
			if (
				// eslint-disable-next-line no-restricted-globals
				confirm(t('Are you sure you want to go back? All the information will be lost'))
			) {
				// window.location.href = '/editor/flightrequest';
				setStep(FlightRequestEditorStep.VOLUME_AND_INFO);
			}
			//setStep(FlightRequestEditorStep.VOLUME_AND_INFO);
		} else if (step === FlightRequestEditorStep.INSURANCE_AND_PAYMENT) {
			setStep(FlightRequestEditorStep.COORDINATIONS);
		}
	};

	useEffect(() => {
		if (flightRequest.urban_flight) {
			setModalProps({
				isVisible: true,
				type: PModalType.INFORMATION,
				title: t('Urban flight'),
				content: t('Urban flight explanation'),
				primary: {
					onClick: () => {
						resetError();
					}
				}
			});
			flightRequest.flight_category = FlightCategory.STS_01;
		} else if (!flightRequest.urban_flight) {
			flightRequest.flight_category = FlightCategory.OPEN;
		}
	}, [flightRequest.urban_flight]);

	if (step === FlightRequestEditorStep.VOLUME_AND_INFO) {
		return (
			<VolumesStep
				{...{
					polygon,
					nextStep,
					flightRequest,
					setPolygon,
					modalProps,
					setModalProps,
					isOnNight,
					setIsOnNight
				}}
			/>
		);
	} else if (step === FlightRequestEditorStep.COORDINATIONS) {
		return (
			<CoordinationsStep
				{...{
					previousStep,
					nextStep,
					flightRequest,
					zonesChecked,
					setZonesChecked,
					total,
					setModalProps,
					modalProps,
					isOnNight,
					setIsOnNight
				}}
			/>
		);
	} else {
		return null;
	}
};

function validateFlightRequest(flightRequest: FlightRequestEntity) {
	const errors = [];
	if (!flightRequest.uavs || flightRequest.uavs.length === 0) {
		errors.push(i18n.t('No drones selected'));
	}
	if (!flightRequest.volumes || flightRequest.volumes.length === 0) {
		errors.push(i18n.t('No zones selected'));
	}
	if (flightRequest.volumes.length === 1 && flightRequest.volumes[0].ordinal === -1) {
		errors.push(i18n.t('No time selected'));
	}
	if (flightRequest.name === '') {
		errors.push(i18n.t('No name selected'));
	}
	for (const volume of flightRequest.volumes) {
		if (volume.ordinal === -1) continue;
		if (!volume.effective_time_begin || !volume.effective_time_end) {
			errors.push(i18n.t('No time selected'));
		}
	}
	return errors;
}

export default observer(LegacyFlightRequestStepsEditor);
