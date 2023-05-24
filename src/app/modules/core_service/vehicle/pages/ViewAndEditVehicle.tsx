import { observer, useObserver } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import styles from '../../../../commons/Pages.module.scss';
import PDropdown from '@pcomponents/PDropdown';
import PVehiclePayloadSelect from '@pcomponents/PVehiclePayloadSelect';
import PDocument from '@pcomponents/PDocument';
import { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { Spinner } from '@blueprintjs/core';
import { PayloadType } from '@utm-entities/payloadType';
import PDocumentTagSelector from '@pcomponents/PDocumentTagSelector';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import { VehicleEntity } from '@utm-entities/vehicle';
import { useAuthIsAdmin, useAuthIsPilot, useAuthStore } from '../../../auth/store';
import {
	useDocumentAvailableTags,
	useDocumentTagSchema,
	useUpdateDocumentObservation,
	UseUpdateDocumentObservationParams,
	useUpdateDocumentValidation,
	UseUpdateDocumentValidationParams
} from '../../../document/hooks';
import { DocumentEntity } from '@utm-entities/document';
import { getWebConsoleLogger } from '../../../../../utils';
import { useSchemaStore } from '../../../schemas/store';
import { ExtraFieldSchemas } from '@utm-entities/extraFields';
import PUserSelectForAdmins from '@pcomponents/PUserSelectForAdmins';
import PUserSelectForPilots from '@pcomponents/PUserSelectForPilots';
import env from '../../../../../vendor/environment/env';
import { UserEntity } from '@utm-entities/user';
import ExtraField from '../../../../commons/components/ExtraField';

export interface BaseVehicleDetailsProps {
	ls: UseLocalStoreEntity<VehicleEntity>;
	isEditing: boolean;
	isCreating: boolean;
	hasSelectedAnAircraftType: boolean;
}

const BaseVehicleDetails: FC<BaseVehicleDetailsProps> = observer(
	({ ls, isEditing, isCreating, hasSelectedAnAircraftType }) => {
		const { t } = useTranslation(['glossary', 'ui']);
		const [payloadTypesDrop, setPayloadTypesDrop] = useState<PayloadType[]>([]);

		const classes = [
			{ label: t('ui:Multi rotor'), value: 'MULTIROTOR' },
			{ label: t('ui:Fixed wing'), value: 'FIXEDWING' },
			{ label: 'VTOL', value: 'VTOL' },
			{ label: t('ui:Other'), value: 'OTHER' }
		];

		return (
			<>
				{Object.entries(ls.entity).map((pair) => {
					const [prop, value] = pair;
					const isNotVisible = isCreating && prop === 'uvin';
					if (
						ls.entity.isBasic(prop) &&
						prop !== 'operators' &&
						!isNotVisible &&
						prop !== 'class' &&
						prop !== 'payload' &&
						prop !== 'faaNumber' &&
						prop !== 'owner_id'
					) {
						const id = `input-${prop}`;
						const label = t(`vehicle.${prop}`);
						const explanation = t(`vehicle.${prop}_desc`);
						const isNotEditable =
							prop === 'uvin' ||
							(hasSelectedAnAircraftType &&
								(prop === 'model' || prop === 'manufacturer'));
						if (typeof value === 'string')
							return (
								<PInput
									key={prop}
									id={id}
									defaultValue={value}
									label={label}
									explanation={explanation}
									disabled={!isEditing || isNotEditable}
									onChange={(value) => {
										// TODO: There's some strange bug where it doesn't recognize the prop as a string, but as this should be improved soon we can ignore it for now
										// Ignore TS7053
										// eslint-disable-next-line @typescript-eslint/ban-ts-comment
										// @ts-ignore
										ls.entity[prop] = value;
									}}
									isRequired
									isDarkVariant
									inline
								/>
							);
					}
					return null;
				})}
				<PDropdown
					id={'class'}
					options={classes}
					defaultValue={ls.entity.class}
					disabled={!isEditing || hasSelectedAnAircraftType}
					label={t('vehicle.class')}
					explanation={t('vehicle.class_desc')}
					onChange={(value) => (ls.entity.class = value)}
					isRequired
					isDarkVariant
					inline
				/>
				<PVehiclePayloadSelect
					id={'payload'}
					disabled={!isEditing}
					label={t('vehicle.payload')}
					onItemSelect={(value) => {
						const arr = [...payloadTypesDrop];
						arr.push(value);
						ls.entity.payload = arr.map((item) => item.id);
						setPayloadTypesDrop(arr);
					}}
					onItemDelete={(index) => {
						const arr = [...payloadTypesDrop];
						if (index > -1) {
							arr.splice(index, 1);
						}
						setPayloadTypesDrop(arr);
					}}
					selected={payloadTypesDrop}
				/>
			</>
		);
	}
);

export interface PDocumentWithSchemaProps {
	ls: UseLocalStoreEntity<VehicleEntity>;
	document: DocumentEntity;
	isEditing: boolean;
	index: number;
}

const PDocumentWithSchema: FC<PDocumentWithSchemaProps> = ({ ls, document, isEditing, index }) => {
	const { t } = useTranslation('glossary');
	const isAdmin = useAuthIsAdmin();
	const { tag } = document;
	const label = t(`vehicle.${tag}`);
	const explanation = t([`vehicle.${tag}_desc`, '']);
	const id = `input-${tag}-${index}`;
	const schemaQuery = useDocumentTagSchema('vehicle', tag);

	const updateDocumentObservationMutation = useUpdateDocumentObservation();
	const updateDocumentValidationMutation = useUpdateDocumentValidation();

	const onSaveObservation = (
		observation: UseUpdateDocumentObservationParams['body']['observation']
	) =>
		updateDocumentObservationMutation.mutate({
			docId: document.id,
			body: { observation, userToNotify: ls.entity.owner?.username || '' }
		});
	const onSaveValidation = (validation: UseUpdateDocumentValidationParams['valid']) =>
		updateDocumentValidationMutation.mutate({
			docId: document.id,
			valid: validation
		});

	if (!schemaQuery.isLoading && schemaQuery.data) {
		return (
			<PDocument
				isEditing={isEditing}
				document={document}
				id={id}
				label={label}
				explanation={explanation}
				isDarkVariant
				schema={schemaQuery.data}
				onClose={() => {
					if (document.isBeingAdded) {
						if (!ls.documents) {
							getWebConsoleLogger().getErrorForDeveloperToFix(
								'ls.documents is undefined in VehiclesViewAndEdit PDocumentWithSchema'
							);
						} else {
							ls.documents.delete(document.id);
						}
					}
				}}
				onSave={(document) => {
					if (!ls.documents) {
						getWebConsoleLogger().getErrorForDeveloperToFix(
							'ls.documents is undefined in VehiclesViewAndEdit PDocumentWithSchema'
						);
					} else {
						ls.documents.set(document.id, document);
					}
				}}
				onDelete={
					document.id.indexOf('TEMP_') === 0
						? () => {
								if (!ls.documents) {
									getWebConsoleLogger().getErrorForDeveloperToFix(
										'ls.documents is undefined in VehiclesViewAndEdit PDocumentWithSchema'
									);
								} else {
									ls.documents.delete(document.id);
								}
						  }
						: undefined
				}
				onSaveObservation={onSaveObservation}
				onSaveValidation={onSaveValidation}
				isAdmin={isAdmin}
			/>
		);
	} else {
		return <Spinner size={8} />;
	}
};

interface _ExtraVehicleFilesProps {
	ls: UseLocalStoreEntity<VehicleEntity>;
	isEditing: boolean;
}

const _ExtraVehicleFiles: FC<_ExtraVehicleFilesProps> = ({ ls, isEditing }) => {
	const { t } = useTranslation('glossary');

	const updateDocumentValidationMutation = useUpdateDocumentValidation();
	const updateDocumentObservationMutation = useUpdateDocumentObservation();
	const vehicleDocumentAvailableTagsQuery = useDocumentAvailableTags('vehicle');

	const isLoading =
		updateDocumentValidationMutation.isLoading || updateDocumentObservationMutation.isLoading;

	useEffect(() => {
		if (
			updateDocumentValidationMutation.isSuccess ||
			updateDocumentObservationMutation.isSuccess
		) {
			window.location.href = `${window.location.href}`;
		}
	}, [updateDocumentValidationMutation.isSuccess, updateDocumentObservationMutation.isSuccess]);

	return (
		ls.entity && (
			<>
				{isEditing && (
					<>
						{vehicleDocumentAvailableTagsQuery.isLoading && <Spinner />}
						{vehicleDocumentAvailableTagsQuery.isSuccess && (
							<PDocumentTagSelector
								onItemSelect={(item) => {
									const tempId = `TEMP_${Math.random()
										.toString(36)
										.substr(2, 9)}`;
									if (!ls.documents) {
										getWebConsoleLogger().getErrorForDeveloperToFix(
											'ls.documents is undefined in VehiclesViewAndEdit _ExtraVehicleFiles'
										);
									} else {
										ls.documents.set(
											tempId,
											new DocumentEntity({
												id: tempId,
												tag: item.value,
												isBeingAdded: true
											})
										);
									}
								}}
								tags={vehicleDocumentAvailableTagsQuery.data.map((tag: string) => ({
									label: t(`vehicle.${tag}`),
									value: tag
								}))}
							/>
						)}
					</>
				)}
				{isLoading && (
					<div style={{ margin: '0 auto' }}>
						<Spinner />
					</div>
				)}
				{isEditing && !isLoading && <h3>{t('ui:Existing documents')}</h3>}
				{!isLoading && ls.entity?.extra_fields?.documents && (
					<>
						{(ls.entity.extra_fields.documents as DocumentEntity[]).map(
							(document: DocumentEntity, index: number) => {
								return (
									<PDocumentWithSchema
										key={document.id}
										ls={ls}
										document={document}
										isEditing={isEditing}
										index={index}
									/>
								);
							}
						)}
					</>
				)}
				{isEditing && !isLoading && <h3>{t('ui:New documents to be added')}</h3>}
				{!isLoading && ls.documents && Array.from(ls.documents.values()).length > 0 && (
					<>
						{Array.from(ls.documents.values()).map((document, index) => {
							if (document.id.indexOf('TEMP_') === 0) {
								return (
									<PDocumentWithSchema
										key={document.id}
										ls={ls}
										document={document}
										isEditing={isEditing}
										index={index}
									/>
								);
							} else {
								return null;
							}
						})}
					</>
				)}
				{!isLoading && ls.documents && Array.from(ls.documents.values()).length > 0 && (
					<h3 style={{ color: 'darkred' }}>
						{t(
							'ui:There are modified or new documents to be saved, please save the changes to the user to store these changes'
						)}
					</h3>
				)}
			</>
		)
	);
};
const ExtraVehicleFiles = observer(_ExtraVehicleFiles);

interface ExtraVehicleDetailsProps {
	ls: UseLocalStoreEntity<VehicleEntity>;
	isEditing: boolean;
}

const ExtraVehicleDetailsValues = ({
	ls,
	schema,
	property,
	required,
	isEditing
}: {
	ls: UseLocalStoreEntity<VehicleEntity>;
	schema: ExtraFieldSchemas['vehicles'];
	property: string;
	required: boolean;
	isEditing: boolean;
}) => {
	const { t } = useTranslation('glossary');
	const schemaValue = schema[property];
	const type = schemaValue.type;
	const label = t(`vehicle.${property}`);
	const explanation = t([`vehicle.${property}_desc`, '']);
	const id = `input-${property}`;
	const value = ls.entity.extra_fields[property];

	if (
		property === 'authorized' ||
		property === 'documents' ||
		property === 'caa_registration' ||
		type === 'File'
	)
		return null;
	if (schemaValue.required === required) {
		return (
			<ExtraField
				key={property}
				isDarkVariant
				isEditing={isEditing}
				{...{
					type,
					property: property,
					required,
					label,
					explanation,
					id,
					value,
					ls
				}}
			/>
		);
	} else {
		return null;
	}
};

interface ExtraVehicleDetailsProps {
	ls: UseLocalStoreEntity<VehicleEntity>;
	isEditing: boolean;
	showAllPropertiesRegardlessOfSchema?: boolean;
}
const ExtraVehicleDetails: FC<ExtraVehicleDetailsProps> = ({ ls, isEditing }) => {
	const { t } = useTranslation('glossary');
	const [insuranceCheckbox, setInsuranceCheckbox] = useState(false);
	// console.log(JSON.stringify(ls, null, 2));

	// TODO: Emprolijar esto que basicamente
	//  hace lo mismo dos veces pero para tener todos los requeridos al principio

	const schema = useSchemaStore((state) => state.vehicles);
	const keys = useMemo(() => Array.from(Object.keys(schema)), [schema]);

	return useObserver(() => {
		if (ls.entity) {
			return (
				<>
					{keys.map((key) => (
						<ExtraVehicleDetailsValues
							key={key}
							property={key}
							ls={ls}
							schema={schema}
							required={true}
							isEditing={isEditing}
						/>
					))}
					{keys.map((key) => (
						<ExtraVehicleDetailsValues
							key={key}
							property={key}
							ls={ls}
							schema={schema}
							required={false}
							isEditing={isEditing}
						/>
					))}
				</>
			);
		} else {
			return null;
		}
	});
};

export interface ViewAndEditVehicleProps {
	ls: UseLocalStoreEntity<VehicleEntity>;
	isEditing: boolean;
	isCreating?: boolean;
	style?: CSSProperties;
	showAllPropertiesRegardlessOfSchema?: boolean;
	hasSelectedAnAircraftType?: boolean;
}

const ViewAndEditVehicle: FC<ViewAndEditVehicleProps> = ({
	ls,
	isEditing,
	isCreating = false,
	style,
	showAllPropertiesRegardlessOfSchema = false,
	hasSelectedAnAircraftType = false
}) => {
	const { t } = useTranslation();
	const isPilot = useAuthIsPilot();
	const isAdmin = useAuthIsAdmin();

	const token = useAuthStore((state) => state.token);
	const schema = useSchemaStore((state) => state.users);

	const [operators, setOperators] = useState<UserEntity[]>([]);

	useEffect(() => {
		if (ls.entity.operators) setOperators(ls.entity.operators);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (ls.entity) {
		return (
			<div className={styles.twobytwo} style={style}>
				<div className={styles.content}>
					<aside className={styles.summary}>
						<h2>{t('Basic details')}</h2>
						{t(
							'To be able to fly in the system the vehicle must be registered and approved by the authority'
						)}
					</aside>
					<section className={styles.details}>
						<BaseVehicleDetails
							isEditing={isEditing}
							isCreating={isCreating}
							ls={ls}
							hasSelectedAnAircraftType={hasSelectedAnAircraftType}
						/>
						<ExtraVehicleDetails
							isEditing={isEditing}
							ls={ls}
							showAllPropertiesRegardlessOfSchema={
								showAllPropertiesRegardlessOfSchema
							}
						/>
					</section>

					<div className={styles.separator} />
					<aside className={styles.summary}>
						<h2>{t('Owner')}</h2>
						{t('Owner explanation')}
					</aside>
					<section className={styles.details}>
						{isPilot && (
							<PUserSelectForPilots
								label={' '}
								id="owner"
								onSelect={(selected) => {
									if (selected.length > 0) {
										ls.entity.owner_id = selected[0];
									} else {
										ls.entity.owner_id = '';
									}
								}}
								preselected={ls.entity.owner_id ? [ls.entity.owner_id] : []}
								fill
								isRequired
								disabled={!isEditing || !isAdmin || !isCreating}
								isDarkVariant
							/>
						)}
						{isAdmin && (
							<PUserSelectForAdmins
								label={' '}
								api={env.core_api}
								token={token}
								schema={schema}
								id="owner"
								onSelect={(selected) => {
									if (selected.length > 0) {
										ls.entity.owner_id = selected[0].username;
										ls.entity.owner = selected[0];
									} else {
										ls.entity.owner_id = '';
										ls.entity.owner = null;
									}
								}}
								preselected={ls.entity.owner ? [ls.entity.owner] : []}
								fill
								isRequired
								disabled={!isEditing || !isAdmin || !isCreating}
								isDarkVariant
							/>
						)}
					</section>

					<div className={styles.separator} />
					<aside className={styles.summary}>
						<h2>{t('Operators')}</h2>
						{t('Operators explanation')}
					</aside>
					<section className={styles.details}>
						{isPilot && (
							<PUserSelectForPilots
								label={' '}
								id="operators"
								onSelect={(selected) => {
									ls.entity.operators = selected;
								}}
								preselected={ls.entity.operators}
								fill
								isRequired
								disabled={!isEditing || !isAdmin || !isCreating}
								isDarkVariant
							/>
						)}
						{isAdmin && (
							<PUserSelectForAdmins
								label={' '}
								api={env.core_api}
								token={token}
								schema={schema}
								single={false}
								id="operators"
								onSelect={(selected) => {
									ls.entity.operators = selected.map((s) => s.username);
									setOperators(selected);
								}}
								preselected={operators}
								fill
								isRequired
								disabled={!isEditing || !isAdmin}
								isDarkVariant
							/>
						)}
					</section>

					<div className={styles.separator} />
					<aside className={styles.summary}>
						<h2>{t('Images')}</h2>
						{t('Images explanation')}
					</aside>
					<section className={styles.details}>
						<ExtraVehicleFiles isEditing={isEditing} ls={ls} />
					</section>
				</div>
			</div>
		);
	} else {
		return null;
	}
};

export default observer(ViewAndEditVehicle);
