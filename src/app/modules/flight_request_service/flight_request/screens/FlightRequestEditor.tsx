/* eslint-disable @typescript-eslint/no-explicit-any */
import { observer } from 'mobx-react';
import { useEffect, useMemo, useState } from 'react';
import { PModalType } from '@pcomponents/PModal';
import { FlightCategory, FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { Polygon } from 'geojson';
import { useTranslation } from 'react-i18next';
import CoordinationsStep from '../pages/editor/CoordinationsStep';
import { PFullModalProps } from '@pcomponents/PFullModal';
import InsuranceAndPaymentStep from '../pages/editor/InsuranceAndPaymentStep';
import i18n from '../../../../i18n';
import env from '../../../../../vendor/environment/env';
import { OperationVolume } from '@utm-entities/v2/model/operation_volume';
import { reactify } from 'svelte-preprocess-react';
import DrawingStepSvelte from '../pages/editor/DrawingStep.svelte';

const DrawingStep = reactify(DrawingStepSvelte);

export interface SubTotals {
	amount: number;
	reason: string;
}

enum FlightRequestEditorStep {
	VOLUME_AND_INFO,
	COORDINATIONS,
	INSURANCE_AND_PAYMENT
}

const FlightRequestEditor = () => {
	const { t } = useTranslation();

	const [polygon, setPolygon] = useState<Polygon | undefined>();
	const [modalProps, setModalProps] = useState<PFullModalProps | undefined>();
	const flightRequest = useMemo(() => {
		const flightRequest = new FlightRequestEntity();
		flightRequest.operator = env.tenant.features.FlightRequests.enabled
			? env.tenant.features.FlightRequests.options.defaultOperatorUsername
			: '';
		const vol = new OperationVolume();
		vol.set('ordinal', -1);
		vol.set('effective_time_begin', null);
		vol.set('effective_time_end', null);

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
		// saveFlightRequestMutation.reset();
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
			if (checkCoordinations(flightRequest)) {
				setModalProps({
					isVisible: true,
					type: PModalType.INFORMATION,
					title: t('Information'),
					content: (
						<p>{t('As 4 days or more were selected, extra charges can be charged')}</p>
					),
					primary: {
						onClick: () => {
							_coordinationsStep();
							setModalProps(undefined);
						}
					},
					secondary: {
						text: 'Cancelar',
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
				window.location.href = '/editor/flightrequest';
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
			<DrawingStep
				{...{
					nextStep,
					flightRequest,
					setPolygon,
					modalProps,
					setModalProps
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
					total
				}}
			/>
		);
	} else if (step === FlightRequestEditorStep.INSURANCE_AND_PAYMENT) {
		return (
			<InsuranceAndPaymentStep
				{...{
					previousStep,
					flightRequest,
					total,
					modalProps,
					setModalProps
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

//this function given a flightRequest checks if there are coordinations for more than 4 days
function checkCoordinations(flightRequest: FlightRequestEntity) {
	let days = 0;
	let lastDate = null;
	const deepCopy = JSON.parse(JSON.stringify(flightRequest));
	(deepCopy.volumes as Array<any>).sort((a, b) => {
		return (
			new Date(a.effective_time_begin).getTime() - new Date(b.effective_time_begin).getTime()
		);
	});

	for (const volume of deepCopy.volumes) {
		if (volume.ordinal === -1) continue;
		if (!volume.effective_time_begin || !volume.effective_time_end) {
			continue;
		}
		const date = new Date(volume.effective_time_begin);
		if (lastDate === null) {
			lastDate = date;
			days++;
		} else {
			if (date.getDate() !== lastDate.getDate()) {
				days++;
			}
			lastDate = date;
		}
	}
	return days >= 4;
}

export default observer(FlightRequestEditor);
