import { ButtonGroup } from '@blueprintjs/core';
import { observer } from 'mobx-react';
import { CSSProperties, FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import { PButtonSize, PButtonType } from '@pcomponents/PButton';
import PButton from '@pcomponents/PButton';
import styles from '../../../../commons/Pages.module.scss';
import { CoordinatorEntity } from '@flight-request-entities/coordinator';
import PTextArea from '@pcomponents/PTextArea';
import PDropdown from '@pcomponents/PDropdown';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import PNumberInput from '@pcomponents/PNumberInput';
import env from '../../../../../vendor/environment/env';

const LiaisonOptions = env.tenant.features.FlightRequests.enabled
	? [...Object.values(env.tenant.features.FlightRequests.options.liaisons)].map((key) => ({
			value: key,
			label: key
	  }))
	: [];
const TypeOptions = env.tenant.features.FlightRequests.enabled
	? [...Object.values(env.tenant.features.FlightRequests.options.coordinatorTypes)].map(
			(key) => ({
				value: key,
				label: key
			})
	  )
	: [];

const specialProps = [
	'geographical_zone',
	'manual_coordinator_procedure',
	'automatic_coordinator_procedure',
	'id'
];
const nonRequiredProps = ['liaison', 'price', 'discount_Multiple_Dates'];
const hiddenProps = ['liaison', 'price', 'discount_Multiple_Dates'];

interface BaseCoordinatorDetailsProps {
	ls: UseLocalStoreEntity<CoordinatorEntity>;
	isEditing: boolean;
	isCreating: boolean;
}

const BaseCoordinatorDetails: FC<BaseCoordinatorDetailsProps> = ({ ls, isEditing, isCreating }) => {
	const { t } = useTranslation(['glossary', 'ui']);
	if (ls.entity) {
		return (
			<>
				{Object.keys(ls.entity)
					.filter((p) => hiddenProps.indexOf(p) === -1)
					.map((_prop) => {
						const prop = _prop as keyof CoordinatorEntity;
						const id = `input-${prop}`;
						const label = t(`coordinator.${prop}`);
						const explanation = t(`coordinator.${prop}_desc`);
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
									onChange={(value) => (ls.entity[prop] = value)}
									isRequired
									isDarkVariant
									inline
								/>
							);
						} else if (prop === 'geographical_zone') {
							let geographicalZoneId = '';
							if (ls.entity.geographical_zone) {
								if (typeof ls.entity.geographical_zone !== 'string') {
									geographicalZoneId = ls.entity.geographical_zone.id as string;
								} else {
									geographicalZoneId = ls.entity.geographical_zone as string;
								}
							}
							return (
								<PInput
									key={prop}
									id={id}
									defaultValue={geographicalZoneId}
									label={label}
									explanation={explanation}
									disabled={!isEditing || isNotEditable}
									onChange={(value) => {
										if (value === '') {
											ls.entity.geographical_zone = null;
										} else {
											ls.entity.geographical_zone = value;
										}
									}}
									isRequired
									isDarkVariant
									inline
								/>
							);
						} else if (prop === 'liaison') {
							return (
								<PDropdown
									key={prop}
									id={id}
									defaultValue={ls.entity.liaison ? ls.entity.liaison : ''}
									label={label}
									explanation={explanation}
									disabled={!isEditing || isNotEditable}
									onChange={(value) => (ls.entity.liaison = value)}
									options={[{ label: '', value: '' }, ...LiaisonOptions]}
									isRequired
									isDarkVariant
									inline
								/>
							);
						} else if (prop === 'type') {
							return (
								<PDropdown
									key={prop}
									id={id}
									defaultValue={ls.entity.type ? ls.entity.type : ''}
									label={label}
									explanation={explanation}
									disabled={!isEditing || isNotEditable}
									onChange={(value) => (ls.entity.type = value)}
									options={[{ label: '', value: '' }, ...TypeOptions]}
									isRequired
									isDarkVariant
									inline
								/>
							);
						} else if (!specialProps.includes(String(prop))) {
							const value = ls.entity[prop as keyof CoordinatorEntity] ?? '';
							// is value number
							if (typeof value === 'number') {
								return (
									<PNumberInput
										key={prop}
										id={id}
										defaultValue={value}
										label={label}
										explanation={explanation}
										disabled={!isEditing || isNotEditable}
										onChange={(value) => ls.setInfo(prop, value)}
										isRequired={!nonRequiredProps.includes(String(prop))}
										isDarkVariant
										inline
									/>
								);
							} else if (typeof value === 'string') {
								return (
									<PInput
										key={prop}
										id={id}
										defaultValue={value}
										label={label}
										explanation={explanation}
										disabled={!isEditing || isNotEditable}
										onChange={(value) => ls.setInfo(prop, value)}
										isRequired={!nonRequiredProps.includes(String(prop))}
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
	}
	return null;
};

interface CoordinatorProcedureProps {
	ls: UseLocalStoreEntity<CoordinatorEntity>;
	isEditing: boolean;
	isCreating: boolean;
}

const CoordinatorProcedure: FC<CoordinatorProcedureProps> = ({ ls, isEditing, isCreating }) => {
	const { t } = useTranslation(['glossary', 'ui']);
	if (!ls.entity) {
		return null;
	}
	const manualProcedure = ls.entity.manual_coordinator_procedure;
	const automaticProcedure = ls.entity.automatic_coordinator_procedure;
	if (manualProcedure) {
		return (
			<>
				<h3>{t('ui:Manual coordinator procedure')}</h3>
				{(isCreating || isEditing) && (
					<PButton
						variant={PButtonType.PRIMARY}
						size={PButtonSize.SMALL}
						onClick={(e) => {
							e.preventDefault();
							ls.entity.manual_coordinator_procedure = null;
							ls.entity.automatic_coordinator_procedure =
								CoordinatorEntity.newAutomaticProcedure();
						}}
					>
						{t('ui:Change to automatic procedure')}
					</PButton>
				)}
				{Object.keys(manualProcedure).map((prop) => {
					const id = `input-${prop}`;
					const label = t(`coordinator.manual_coordinator_procedure.${prop}`);
					const explanation = t(`coordinator.manual_coordinator_procedure.${prop}_desc`);
					const isNotEditable = false;
					if (!specialProps.includes(prop)) {
						const value = ls.entity.manual_coordinator_procedure
							? ls.entity.manual_coordinator_procedure[prop]
							: '';
						return (
							<PInput
								key={prop}
								id={id}
								defaultValue={value}
								label={label}
								explanation={explanation}
								disabled={!isEditing || isNotEditable}
								onChange={(value) =>
									(ls.entity.manual_coordinator_procedure = {
										...manualProcedure,
										[prop]: value
									})
								}
								isRequired
								isDarkVariant
								inline
							/>
						);
					} else {
						return null;
					}
				})}
			</>
		);
	} else if (automaticProcedure) {
		return (
			<>
				<h3>{t('ui:Automatic coordinator procedure')}</h3>
				{isEditing && (
					<PButton
						variant={PButtonType.PRIMARY}
						size={PButtonSize.SMALL}
						onClick={(e) => {
							e.preventDefault();
							ls.entity.automatic_coordinator_procedure = null;
							ls.entity.manual_coordinator_procedure =
								CoordinatorEntity.newManualProcedure();
						}}
					>
						{t('ui:Change to manual procedure')}
					</PButton>
				)}
				{Object.keys(automaticProcedure).map((prop) => {
					const id = `input-${prop}`;
					const label = t(`coordinator.automatic_coordinator_procedure.${prop}`);
					const explanation = t(
						`coordinator.automatic_coordinator_procedure.${prop}_desc`
					);
					const isNotEditable = false;
					if (!specialProps.includes(prop)) {
						if (prop === 'template_html') {
							return (
								<PTextArea
									key={prop}
									id={id}
									defaultValue={
										automaticProcedure[prop] ? automaticProcedure[prop] : ''
									}
									label={label}
									explanation={explanation}
									disabled={!isEditing || isNotEditable}
									onChange={(value) =>
										(ls.entity.automatic_coordinator_procedure = {
											...automaticProcedure,
											[prop]: value
										})
									}
									isRequired
									isDarkVariant
									inline
								/>
							);
						} else {
							return (
								<PInput
									key={prop}
									id={id}
									defaultValue={
										automaticProcedure[prop] ? automaticProcedure[prop] : ''
									}
									label={label}
									explanation={explanation}
									disabled={!isEditing || isNotEditable}
									onChange={(value) =>
										(ls.entity.automatic_coordinator_procedure = {
											...automaticProcedure,
											[prop]: value
										})
									}
									isRequired
									isDarkVariant
									inline
								/>
							);
						}
					} else {
						return null;
					}
				})}
			</>
		);
	} else {
		return (
			<div>
				<h3>{t('ui:There is no associated procedure for this coordinator')}</h3>
				<ButtonGroup>
					<PButton
						style={{ maxWidth: '155px' }}
						onClick={() => {
							ls.entity.automatic_coordinator_procedure =
								CoordinatorEntity.newAutomaticProcedure();
						}}
					>
						{t('ui:Create automatic procedure')}
					</PButton>
					<PButton
						style={{ maxWidth: '155px' }}
						onClick={() => {
							ls.entity.manual_coordinator_procedure =
								CoordinatorEntity.newManualProcedure();
						}}
					>
						{t('ui:Create manual procedure')}
					</PButton>
				</ButtonGroup>
			</div>
		);
	}
};

interface ViewAndEditCoordinatorProps {
	ls: UseLocalStoreEntity<CoordinatorEntity>;
	isEditing: boolean;
	isCreating?: boolean;
	style?: CSSProperties;
}

const ViewAndEditCoordinator: FC<ViewAndEditCoordinatorProps> = ({
	ls,
	isEditing,
	isCreating = false,
	style
}) => {
	const { t } = useTranslation();

	useEffect(() => {
		// Do not remove this useEffect, it is needed to rerender the component.
	}, [ls.entity?.automatic_coordinator_procedure, ls.entity?.manual_coordinator_procedure]);

	return (
		<div className={styles.twobytwo} style={style}>
			<div className={styles.content}>
				<aside className={styles.summary}>
					<h2>{t('Information')}</h2>
				</aside>
				<section className={styles.details}>
					<BaseCoordinatorDetails isEditing={isEditing} isCreating={isCreating} ls={ls} />
				</section>
			</div>
			<div className={styles.content}>
				<aside className={styles.summary}>
					<h2>{t('Procedures')}</h2>
				</aside>
				<section className={styles.details}>
					<CoordinatorProcedure ls={ls} isEditing={isEditing} isCreating={isCreating} />
				</section>
			</div>
		</div>
	);
};

export default observer(ViewAndEditCoordinator);
