import { observer, useLocalStore } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import styles from '../../../../commons/Pages.module.scss';
import PCoordinationStateSelect from '@pcomponents/PCoordinationStateSelect';
import { CSSProperties, FC } from 'react';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import { CoordinationEntity, CoordinationState } from '@flight-request-entities/coordination';
import ViewAndEditFlightRequest from '../../flight_request/pages/ViewAndEditFlightRequest';
import { FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { Button } from '@blueprintjs/core';
import PButton from '@pcomponents/PButton';

const specialProps = ['id', 'state'];
const nonRequiredProps = ['email', 'telephone', 'price', 'discount_Multiple_Dates'];

interface BaseCoordinationDetailsProps {
	ls: UseLocalStoreEntity<CoordinationEntity>;
	isEditing: boolean;
	isCreating?: boolean;
}

const BaseCoordinationDetails: FC<BaseCoordinationDetailsProps> = ({
	ls,
	isEditing,
	isCreating
}) => {
	const { t } = useTranslation('glossary');
	if (!ls.entity) {
		return null;
	}
	return (
		<>
			{Object.keys(ls.entity).map((_prop) => {
				const prop = _prop as keyof CoordinationEntity;
				const id = `input-${prop}`;
				const label = t(`coordination.${prop}`);
				const explanation = t(`coordination.${prop}_desc`);
				const isNotEditable = false;
				if (!isCreating && prop === 'id') {
					return (
						<PInput
							key={prop}
							id={id}
							defaultValue={ls.entity[prop] ? ls.entity[prop] : ''}
							label={label}
							explanation={explanation}
							disabled={true}
							onChange={(value: string) => ls.setInfo(prop, value)}
							isRequired
							isDarkVariant
							inline
						/>
					);
				} else if (prop === 'state') {
					// Return a select with all possible coordination states
					return (
						<PCoordinationStateSelect
							isDarkVariant
							inline
							disabled={!isEditing}
							onChange={(value: CoordinationState) => ls.setInfo(prop, value)}
							id={'coordination-state-select'}
						/>
					);
				} else if (!specialProps.includes(prop)) {
					const value = ls.entity[prop] || '';
					// is value number
					if (typeof value === 'string') {
						return (
							<PInput
								key={prop}
								id={id}
								defaultValue={value}
								label={label}
								explanation={explanation}
								disabled={!isEditing || isNotEditable}
								onChange={(value: string) => ls.setInfo(prop, value)}
								isRequired={!nonRequiredProps.includes(prop)}
								isDarkVariant
								inline
							/>
						);
					} else {
						return null;
					}
				} else {
					return null;
				}
			})}
		</>
	);
};

interface ViewAndEditCoordinationProps {
	ls: UseLocalStoreEntity<CoordinationEntity>;
	isEditing: boolean;
	isCreating?: boolean;
	style?: CSSProperties;
}

const ViewAndEditCoordination: FC<ViewAndEditCoordinationProps> = ({
	ls,
	isEditing,
	isCreating = false,
	style
}) => {
	const { t } = useTranslation();
	const lsFr: UseLocalStoreEntity<FlightRequestEntity> = useLocalStore(() => ({
		entity: ls.entity.flightRequest,
		documents: new Map(),

		setInfo(
			prop: keyof FlightRequestEntity,
			value: FlightRequestEntity[keyof FlightRequestEntity]
		) {
			if (ls.entity) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				ls.entity[prop] = value;
			}
		}
	}));
	return (
		<div className={styles.twobytwo} style={style}>
			<div className={styles.content}>
				<aside className={styles.summary}>
					<h2>{t('Coordination information')}</h2>
				</aside>
				<section className={styles.details}>
					<BaseCoordinationDetails
						isEditing={isEditing}
						isCreating={isCreating}
						ls={ls}
					/>
				</section>
				{/* <aside className={styles.flightRequestInfo}>
					<h2>{t('Flight request information')}</h2>
				</aside>
				<section>
					<ViewAndEditFlightRequest
						ls={lsFr}
						isEditing={false}
					/>
				</section> */}
			</div>
			<div className={styles.flightRequestInfo}>
				<h2 className={styles.title}>{t('Flight request information')}</h2>
				<ViewAndEditFlightRequest ls={lsFr} isEditing={false} />
				<div className={styles.moreDetails}>
					<PButton
						text={t('Flight Request Details')}
						onClick={() => {
							window.open(`/flight-requests?id=${lsFr.entity?.id}`, '_blank');
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default observer(ViewAndEditCoordination);
