import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import styles from '../../../../commons/Pages.module.scss';
import PDropdown from '@pcomponents/PDropdown';
import PTextArea from '@pcomponents/PTextArea';

import PBooleanInput from '@pcomponents/PBooleanInput';
import PButton, { PButtonSize, PButtonType } from '@pcomponents/PButton';
import { useHistory } from 'react-router-dom';
import { CSSProperties, FC, useEffect, useState } from 'react';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import { FlightCategory, FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { useUpdateCoordination } from '../../coordination/hooks';
import { CoordinationState } from '@flight-request-entities/coordination';
import PUserSelectForAdmins from '@pcomponents/PUserSelectForAdmins';
import { UserEntity } from '@utm-entities/user';
import { useQueryVehicle } from '../../../core_service/vehicle/hooks';
import { Spinner } from '@blueprintjs/core';
import PFullModal from '@pcomponents/PFullModal';
import PNumberInput from '@pcomponents/PNumberInput';
import PDateInput from '@pcomponents/PDateInput';
import styled from 'styled-components';
import PTooltip from '@pcomponents/PTooltip';

const specialProps = ['volumes', 'uavs', 'operator', 'paid', 'id'];

interface BaseFlightRequestDetailsProps {
	ls: UseLocalStoreEntity<FlightRequestEntity>;
	isEditing: boolean;
}

const StateExplanationText = styled.div`
	display: flex;
	background-color: var(--primary-500);
	color: var(--white-100);
	border-radius: var(--radius-l);
	padding: var(--padding-s);
`;

const PaidStateCircle = styled.div`
	height: 1rem;
	width: 1rem;
	border-radius: 100%;
	margin-right: 0.5rem;
	border: 1px solid rgb(var(--mirai-900-rgb), 0.25);
	box-shadow: 0 1px 1px 0 rgba (0, 0, 0, 0.25);
	filter: saturate(0.75);
`;

const PaymentLine = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	text-transform: uppercase;
	color: var(--primary-900);
`;

const BaseFlightRequestDetails: FC<BaseFlightRequestDetailsProps> = observer(
	({ ls, isEditing }) => {
		const { t } = useTranslation('glossary');
		if (!ls.entity) {
			return null;
		}

		return (
			<>
				{Object.keys(ls.entity).map((_prop) => {
					const prop = _prop as keyof FlightRequestEntity;
					if (specialProps.includes(prop as string)) {
						return null;
					}
					const entity = ls.entity;
					const value = entity[prop];

					if (prop === 'creator' || prop === 'id') return null;
					if (prop === 'flight_comments') {
						return (
							<PTextArea
								style={{ width: '100%' }}
								key={prop}
								id={`editor-flight-request-${prop}`}
								defaultValue={entity[prop]}
								label={t(`glossary:flight-request.${prop}`)}
								disabled={!isEditing}
								onChange={(value) => ls.setInfo(prop, value)}
								isDarkVariant
							/>
						);
					}
					// If user selected not dji blocked then hide dji blocked fields
					if (['dji_controller_number', 'dji_email'].includes(prop as string)) {
						if (!entity.dji_blocked) {
							return null;
						}
					}
					// If user said is not a urban flight then hide parachute model
					if (prop === 'parachute_model') {
						if (!entity.urban_flight) {
							return null;
						}
					}
					if (prop === 'flight_category') {
						return (
							<PDropdown
								key={prop}
								options={Object.values(FlightCategory).map((value) => ({
									value: value,
									label: t(`glossary:flight-request.flight_category.${value}`)
								}))}
								id={`editor-flight-request-${prop}`}
								defaultValue={entity[prop]}
								label={t(`glossary:flight-request.flightCategory`)}
								onChange={(value) => ls.setInfo(prop, value)}
								isRequired
								disabled={!isEditing}
								isDarkVariant
							/>
						);
					}

					if (prop === 'state') {
						return (
							// <PDropdown
							// 	key={prop}
							// 	options={Object.values(FlightRequestState).map((value) => ({
							// 		value: value,
							// 		label: t(`glossary:flightRequest.flight_state.${value}`)
							// 	}))}
							// 	id={`editor-flightRequest-${prop}`}
							// 	defaultValue={entity[prop]}
							// 	label={t(`glossary:flightRequest.state`)}
							// 	onChange={(value) => setInfo(prop, value)}
							// 	isRequired
							// 	disabled={!isEditing}
							// 	isDarkVariant
							// 	inline
							// />
							<>
								<PInput
									key={prop}
									id={`editor-flight-request-${prop}`}
									defaultValue={t(
										'glossary:flight-request.flight_state.' + entity[prop]
									)}
									label={t(`glossary:flight-request.state`)}
									disabled={true}
									isDarkVariant
								/>
								<StateExplanationText>
									{t(
										'glossary:flight-request.flight_state_explanation.' +
											entity[prop]
									)}
								</StateExplanationText>
							</>
						);
					}
					if (typeof value === 'string') {
						return (
							<PInput
								key={prop}
								id={`editor-flight-request-${prop}`}
								defaultValue={value}
								label={t(`glossary:flight-request.${prop}`)}
								onChange={(value) => ls.setInfo(prop, value)}
								isRequired
								disabled={!isEditing}
								isDarkVariant
							/>
						);
					} else if (typeof value === 'boolean') {
						return (
							<PBooleanInput
								key={prop}
								id={`editor-volume-${prop}`}
								defaultValue={value}
								label={t(`flight-request.${prop}`)}
								disabled={!isEditing}
								onChange={(value) => ls.setInfo(prop, value)}
								isRequired
								isDarkVariant
							/>
						);
					} else {
						return null;
					}
				})}
			</>
		);
	}
);

interface FlightRequestCoordinationsProps {
	ls: UseLocalStoreEntity<FlightRequestEntity>;
	isEditing: boolean;
}

const FlightRequestCoordinations: FC<FlightRequestCoordinationsProps> = ({ ls, isEditing }) => {
	const { t } = useTranslation('glossary');
	const [edit, setEdit] = useState<string[]>([]);
	const updateCoordination = useUpdateCoordination();
	const history = useHistory();
	const entity = ls.entity;
	if (!entity) {
		return null;
	}
	if (!entity.coordination || entity.coordination?.length === 0) {
		return <h2>{t('flight-request.noCoordination')}</h2>;
	}
	return (
		<div>
			{entity.coordination.map((coordination, index) => {
				return (
					<div key={coordination.id} className={styles.info_table}>
						<div>{coordination.id} </div>
						<div className={styles.state}>
							<PDropdown
								key={'coordination-state'}
								options={Object.values(CoordinationState).map((value) => ({
									value: value,
									label: t(`glossary:coordination.states.${value}`)
								}))}
								id={'coordination-state'}
								defaultValue={coordination.state as CoordinationState}
								label={''}
								onChange={(value) => (coordination.state = value)}
								isRequired
								disabled={!edit.find((e) => e === coordination.id)}
								isDarkVariant
								inline
							/>
						</div>
						<div className={styles.date}>
							{new Date(coordination.limit_date as Date).toLocaleString()}
						</div>
						<PButton
							icon="info-sign"
							size={PButtonSize.EXTRA_SMALL}
							onClick={() => {
								history.push(`/coordinations?id=${coordination.id}`);
							}}
						></PButton>
						<PButton
							icon={edit.find((e) => e === coordination.id) ? 'floppy-disk' : 'edit'}
							size={PButtonSize.EXTRA_SMALL}
							onClick={() => {
								//If it is editing, then save and change to not editing mode
								if (edit.find((e) => e === coordination.id)) {
									setEdit(edit.filter((e) => e !== coordination.id));
									const coordinationToSave = {
										...coordination,
										flightRequest: { id: entity.id }
									};

									updateCoordination.mutate({
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore
										entity: coordinationToSave
									});
								} else {
									//Enters editing mode
									setEdit([...edit, coordination.id as string]);
								}
							}}
						></PButton>
					</div>
				);
			})}
		</div>
	);
};

interface OperatorDetailsProps {
	ls: UseLocalStoreEntity<FlightRequestEntity>;
}

const OperatorDetails: FC<OperatorDetailsProps> = ({ ls }) => {
	const { t } = useTranslation('glossary');
	const entity = ls.entity;
	if (!entity) {
		return null;
	}
	if (!entity.operator) {
		return <h2>{t('flightRequest.noOperator')}</h2>;
	}
	return (
		<PUserSelectForAdmins
			id="operator"
			onSelect={(selected) => null}
			label={t('flight-request.operator')}
			preselected={[entity.operator as UserEntity]}
			fill
			disabled={true}
			isDarkVariant
			api={''}
			token={''}
			schema={{}}
		/>
	);
};

interface UavsDetailsProps {
	ls: UseLocalStoreEntity<FlightRequestEntity>;
}

const UavDetail = (props: { uvin: string }) => {
	const { t } = useTranslation();
	const history = useHistory();

	const query = useQueryVehicle(props.uvin);
	const { vehicle, refetch } = query;

	useEffect(() => {
		refetch().then();
	}, [refetch]);

	if (query.isSuccess) {
		return (
			<div className={styles.leftbalancedline}>
				{vehicle.asNiceString}
				<PButton
					icon="info-sign"
					size={PButtonSize.EXTRA_SMALL}
					variant={PButtonType.SECONDARY}
					onClick={() => history.push(`/vehicles?id=${vehicle.uvin}`)}
				/>
			</div>
		);
	} else if (query.isLoading) {
		return <Spinner />;
	} else {
		return <p>{t('Vehicle not found')}</p>;
	}
};

const UavsDetails: FC<UavsDetailsProps> = ({ ls }) => {
	const { t } = useTranslation('glossary');
	const entity = ls.entity;

	if (!entity) {
		return null;
	}

	if (!entity.uavs || entity.uavs?.length === 0) {
		return <h2>{t('flightRequest.noUavs')}</h2>;
	}
	return (
		<>
			{entity.uavs.map((vehicle) => {
				return <UavDetail key={vehicle.uvin} uvin={vehicle.uvin} />;
			})}
		</>
	);
};

interface VolumeDetailsProps {
	ls: UseLocalStoreEntity<FlightRequestEntity>;
	volume: number;
	isEditing: boolean;
}
const VolumeDetails: FC<VolumeDetailsProps> = ({ ls, volume, isEditing }) => {
	const { t } = useTranslation(['ui', 'glossary']);

	if (ls.entity.volumes.length >= volume + 1) {
		return (
			<div style={{ backgroundColor: 'var(--mirai-150)' }}>
				<h2>
					{t('Volume')} {volume + 1}
				</h2>
				<PNumberInput
					id={`editor-flight-request-volume-${volume}-max_altitude`}
					defaultValue={ls.entity.volumes[volume].max_altitude}
					label={t(`glossary:volume.max_altitude`)}
					onChange={(value) => ls.entity.volumes[volume].set('max_altitude', value)}
					disabled={!isEditing}
					isDarkVariant
					inline={false}
					isRequired={isEditing}
				/>
				<PDateInput
					id={`editor-flight-request-volume-${volume}-effective_time_begin`}
					label={t('glossary:volume.effective_time_begin')}
					disabled={!isEditing}
					isDarkVariant
					isTime
					isRequired={isEditing}
					defaultValue={ls.entity.volumes[volume].effective_time_begin || undefined}
					onChange={(value) =>
						ls.entity.volumes[volume].set('effective_time_begin', value)
					}
				/>
				<PDateInput
					id={`editor-flight-request-volume-${volume}-effective_time_end`}
					label={t('glossary:volume.effective_time_end')}
					disabled={!isEditing}
					isDarkVariant
					isTime
					isRequired={isEditing}
					defaultValue={ls.entity.volumes[volume].effective_time_end || undefined}
					onChange={(value) => ls.entity.volumes[volume].set('effective_time_end', value)}
				/>
			</div>
		);
	} else {
		return null;
	}
};

interface CreatorDetailsProps {
	ls: UseLocalStoreEntity<FlightRequestEntity>;
}

const CreatorDetails: FC<CreatorDetailsProps> = ({ ls }) => {
	const { t } = useTranslation('glossary');
	const entity = ls.entity;
	if (!entity) {
		return null;
	}
	if (!entity.creator) {
		return <h2>{t('flight-request.noCreator')}</h2>;
	}
	return (
		<PUserSelectForAdmins
			id="creator"
			onSelect={(selected) => null}
			label={t('flight-request.creator')}
			preselected={[entity.creator as UserEntity]}
			fill
			disabled={true}
			isDarkVariant
			api={''}
			schema={{}}
			token={''}
		/>
	);
};

interface ViewAndEditFlightRequestProps {
	ls: UseLocalStoreEntity<FlightRequestEntity>;
	isEditing: boolean;
	style?: CSSProperties;
}

const ViewAndEditFlightRequest: FC<ViewAndEditFlightRequestProps> = ({
	ls,
	isEditing,
	style = {}
}) => {
	const { t } = useTranslation();

	if (!ls.entity) {
		return null;
	}

	return (
		<div className={styles.twobytwo} style={style}>
			<div className={styles.content}>
				<aside className={styles.summary}>
					<h2>{t('Flight Request information')}</h2>
					<PTooltip content={t('Paid')}>
						<PaymentLine>
							<PaidStateCircle
								style={{
									backgroundColor: ls.entity.paid ? 'green' : 'red'
								}}
							/>
							{ls.entity.paid ? t('Paid') : t('Pending payment')}
						</PaymentLine>
					</PTooltip>
				</aside>
				<section className={styles.details}>
					<PInput
						key={'input-id'}
						id={'input-id'}
						defaultValue={ls.entity.id}
						label={t('glossary:flight-request.id')}
						disabled={true}
						isDarkVariant
					/>

					<BaseFlightRequestDetails isEditing={isEditing} ls={ls} />
				</section>
				<div className={styles.separator} />

				<aside className={styles.summary}>
					<h2>{t('Volumes')}</h2>
				</aside>
				<section className={styles.details}>
					{ls.entity.volumes.map((volume, index) => {
						return (
							<VolumeDetails
								key={volume.ordinal}
								isEditing={isEditing}
								ls={ls}
								volume={index}
							/>
						);
					})}
				</section>

				<aside className={styles.summary}>
					<h2>{t('Flight Request Operator')}</h2>
				</aside>
				<section className={styles.details}>
					<OperatorDetails ls={ls} />
				</section>
				<div className={styles.separator} />
				<aside className={styles.summary}>
					<h2>{t('Flight Request Creator')}</h2>
				</aside>
				<section className={styles.details}>
					<CreatorDetails ls={ls} />
				</section>
				<div className={styles.separator} />

				<aside className={styles.summary}>
					<h2>{t('Flight Request UAVs')}</h2>
				</aside>
				<section className={styles.details}>
					<UavsDetails ls={ls} />
				</section>
				<div className={styles.separator} />
				<aside className={styles.summary}>
					<h2>{t('Flight Request coordinations')}</h2>
				</aside>
				<section className={styles.details}>
					<FlightRequestCoordinations isEditing={isEditing} ls={ls} />
				</section>
			</div>
		</div>
	);
};

export default observer(ViewAndEditFlightRequest);
