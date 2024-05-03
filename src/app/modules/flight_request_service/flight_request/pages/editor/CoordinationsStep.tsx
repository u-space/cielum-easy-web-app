import PButton from '@pcomponents/PButton';
import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { Checkbox, Spinner } from '@blueprintjs/core';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import PageLayout from '../../../../../commons/layouts/PageLayout';
import { useQueryGeographicalZonesIntersectingPolygon } from '../../../geographical_zone/hooks';
import { FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { Polygon } from 'geojson';
import styles from '../../../../../commons/Pages.module.scss';
import { SubTotals } from '../../screens/LegacyFlightRequestStepsEditor';
import DashboardLayout from '../../../../../commons/layouts/DashboardLayout';
import PFullModal, { PFullModalProps } from '@pcomponents/PFullModal';
import { useFlightRequestServiceAPI } from 'src/app/utils';
import { useMutation } from 'react-query';
import { PModalType } from '@pcomponents/PModal';
import { translateErrors } from '@utm-entities/_util';
import { useHistory } from 'react-router-dom';

interface FlightRequestCoordinationsStepProps {
	previousStep: () => void;
	nextStep: () => void;
	flightRequest: FlightRequestEntity;
	zonesChecked: GeographicalZone[];
	setZonesChecked: (zones: GeographicalZone[]) => void;
	total: SubTotals[];
	setModalProps: (props: PFullModalProps | undefined) => void;
	modalProps: PFullModalProps | undefined;
}

const CoordinationsStep = (props: FlightRequestCoordinationsStepProps) => {
	const { t } = useTranslation();
	const history = useHistory();

	const {
		previousStep,
		nextStep,
		flightRequest,
		zonesChecked,
		setZonesChecked,
		total,
		setModalProps,
		modalProps
	} = props;

	const [isShowingExplanation, setShowingExplanation] = useState(false);

	useEffect(() => {
		if (flightRequest.volumes[0].operation_geography === null) alert('Error occured');
	}, [flightRequest]);

	const { intersections: geographicalZonesIntersectingVolume, isLoading } =
		useQueryGeographicalZonesIntersectingPolygon(
			flightRequest.volumes[0]?.operation_geography as Polygon // This is checked on FlightRequestEditor
		);

	const totalNumber = useMemo(() => {
		return total.reduce((acc, obj) => acc + obj.amount, 0);
	}, [total]);

	useEffect(() => {
		if (geographicalZonesIntersectingVolume) {
			setZonesChecked(
				geographicalZonesIntersectingVolume.map((zone: GeographicalZone) => zone.id)
			);
		}
	}, [geographicalZonesIntersectingVolume]);

	const {
		flightRequest: { saveFlightRequest }
	} = useFlightRequestServiceAPI();

	const saveFlightRequestMutation = useMutation(
		async () => {
			return saveFlightRequest(flightRequest);
		},
		{
			onSuccess: (data) => {
				// window.location.href = data.paymentLink;
				setModalProps({
					isVisible: true,
					type: PModalType.SUCCESS,
					title: t('Flight request saved'),
					content: t(JSON.stringify(data)),
					primary: {
						onClick: () => {
							setModalProps(undefined);
							history.push('/flight-requests');
						}
					}
				});
			},
			onError: (error) => {
				setModalProps({
					isVisible: true,
					type: PModalType.ERROR,
					title: t('An error ocurred while saving'),
					content: translateErrors(error, 'operation'),
					primary: {
						onClick: () => {
							setModalProps(undefined);
							history.push('/flight-requests');
						}
					}
				});
			}
		}
	);

	const finishAndPay = (evt: FormEvent) => {
		evt.preventDefault();
		saveFlightRequestMutation.mutate();
	};

	return (
		<DashboardLayout isLoading={isLoading || saveFlightRequestMutation.isLoading}>
			<PageLayout
				onArrowBack={previousStep}
				footer={
					<PButton disabled={totalNumber === 0} onClick={finishAndPay}>
						{t('Continue')}
					</PButton>
				}
			>
				{modalProps && <PFullModal {...modalProps} />}
				<PFullModal
					title={t('Coordinations')}
					content={t('Coordinations explanation')}
					isVisible={isShowingExplanation}
					primary={{
						text: t('Close'),
						onClick: () => setShowingExplanation(false)
					}}
				/>
				<div className={styles.twobytwo}>
					<div className={styles.content}>
						<aside className={styles.summary}>
							<h2>{t('Coordinations')}</h2>
							{t('Coordinations explanation').length > 255 && (
								<>
									{t('Coordinations explanation').substring(0, 255)}
									{'...'}
									<PButton onClick={() => setShowingExplanation(true)}>
										{t('See more')}
									</PButton>
								</>
							)}
							{t('Coordinations explanation').length <= 255 && (
								<>{t('Coordinations explanation')}</>
							)}
						</aside>
						<section className={styles.details}>
							{isLoading && <Spinner />}
							{geographicalZonesIntersectingVolume?.map(
								(zone: GeographicalZone, index: number) => (
									<Checkbox
										id={`coordination-${index}`}
										key={zone.id}
										label={`${zone.name} (${zone.id}) - ${zone.coordinator?.email}`}
										checked={
											true //zonesChecked.find((z) => z.id === zone.id) !== undefined
										}
										onChange={(value) => {
											console.log('zone::', zonesChecked);
											// if (value.currentTarget.checked) {
											// 	setZonesChecked([...zonesChecked, zone]);
											// } else {
											// 	setZonesChecked(
											// 		zonesChecked.filter((z) => z.id !== zone.id)
											// 	);
											// }
										}}
									></Checkbox>
								)
							)}
						</section>
					</div>
					{/* <div className={styles.content}>
						<aside className={styles.summary}>
							<h2>{t('Sub-total')}</h2>
							<h1>{totalNumber}€</h1>
						</aside>
						<section className={styles.details}>
							<ul>
								{total.map((item, index) => (
									<li key={item.reason}>
										{item.amount}€ {item.reason}
									</li>
								))}
							</ul>
						</section>
					</div> */}
				</div>
			</PageLayout>
		</DashboardLayout>
	);
};

export default observer(CoordinationsStep);
