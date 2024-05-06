import { Spinner } from '@blueprintjs/core';
import PButton, { PButtonSize, PButtonType } from '@pcomponents/PButton';
import PDocument from '@pcomponents/PDocument';
import PDocumentTagSelector from '@pcomponents/PDocumentTagSelector';
import PInput from '@pcomponents/PInput';
import PUserRoleSelect from '@pcomponents/PUserRoleSelect';
import { DocumentEntity } from '@utm-entities/document';
import { observer, useObserver } from 'mobx-react';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import {
	useDocumentAvailableTags,
	useDocumentTagSchema,
	useUpdateDocumentObservation,
	useUpdateDocumentValidation
} from '../../../document/hooks';
import styles from '../../../../commons/Pages.module.scss';
import ExtraField from '../../../../commons/components/ExtraField';
import { useAuthGetRole, useAuthIsAdmin, useAuthStore } from '../../../auth/store';
import { useSchemaStore } from '../../../schemas/store';
import { VehicleEntity } from '@utm-entities/vehicle';
import PasswordChanger from '../components/PasswordChanger';
import { ExtraFieldSchemas } from '@utm-entities/extraFields';
import { UserEntity } from '@utm-entities/user';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import styled from 'styled-components';
import PFullModal, { PFullModalProps, undefinedModal } from '@pcomponents/PFullModal';
import { PModalType } from '@pcomponents/PModal';

interface BaseUserDetailsProps {
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	ls: any;
	isEditing: boolean;
	isCreating: boolean;
	isAbleToChangeRole: boolean;
}

const BaseUserDetails = (props: BaseUserDetailsProps) => {
	const { ls, isEditing, isCreating, isAbleToChangeRole } = props;
	const { t } = useTranslation('glossary');
	// const role = useAuthGetRole();

	return (
		<>
			{Object.keys(ls.entity).map((prop) => {
				if (ls.entity.isBasic(prop)) {
					const id = `input-${prop}`;
					const label = t(`user.${prop}`);
					const explanation = t(`user.${prop}_desc`);
					const isNotEditable =
						!isCreating &&
						// role !== 'ADMIN' &&
						(prop === 'username' || prop === 'email');
					let autoComplete = 'off';
					switch (prop) {
						case 'username':
							autoComplete = 'username';
							break;
						case 'email':
							autoComplete = 'email';
							break;
						case 'firstName':
							autoComplete = 'given-name';
							break;
						case 'lastName':
							autoComplete = 'family-name';
							break;
					}
					if (prop === 'username') {
						return null;
					} else if (prop !== 'role') {
						return (
							<PInput
								key={prop}
								id={id}
								defaultValue={ls.entity[prop]}
								label={label}
								autoComplete={autoComplete}
								explanation={explanation}
								disabled={!isEditing || isNotEditable}
								onChange={(value) => (ls.entity[prop as keyof UserEntity] = value)}
								isRequired
								isDarkVariant
								inline
							/>
						);
					} else if (isAbleToChangeRole) {
						return (
							<PUserRoleSelect
								key={prop}
								id={prop}
								label={t('glossary:user.role')}
								defaultValue={ls.entity.role}
								onChange={(value: string) => (ls.entity.role = value)}
								isDarkVariant
								inline
								isRequired
								disabled={!isEditing}
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

interface PDocumentWithSchemaProps {
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	ls: any;
	document: DocumentEntity;
	isEditing: boolean;
	index: number;
}

const PDocumentWithSchema = (props: PDocumentWithSchemaProps) => {
	const { ls, document, isEditing, index } = props;
	const { t } = useTranslation(['glossary', 'ui']);
	const isAdmin = useAuthIsAdmin();
	const { tag } = document;
	const name = document.name || document.file?.name;
	const label = name ? `${t('ui:Type')}: ${t(`user.${tag}`)} (${name})` : t(`user.${tag}`);
	const explanation = t([`user.${tag}_desc`, '']);
	const id = `input-${tag}-${index}`;
	const schemaQuery = useDocumentTagSchema('user', tag);

	const updateDocumentValidationMutation = useUpdateDocumentValidation();
	const updateDocumentObservationMutation = useUpdateDocumentObservation();

	const onSaveObservation = (observation: string) => {
		updateDocumentObservationMutation.mutate({
			docId: document.id,
			body: {
				observation,
				userToNotify: ls.entity.username
			}
		});
	};
	const onSaveValidation = (validation: boolean) => {
		updateDocumentValidationMutation.mutate({
			docId: document.id,
			valid: validation
		});
	};

	if (!schemaQuery.isLoading && schemaQuery.data) {
		return (
			<div
				style={{
					backgroundColor: 'var(--mirai-150)',
					flex: 1
				}}
			>
				<PDocument
					isEditing={isEditing}
					document={document}
					id={id}
					label={label}
					explanation={explanation}
					isDarkVariant
					schema={schemaQuery.data}
					onSave={(document) => {
						ls.documents.set(document.id, document);
					}}
					onClose={() => {
						if (document.isBeingAdded) {
							ls.documents.delete(document.id);
						}
					}}
					onDelete={
						ls.documents?.has(document.id)
							? () => ls.documents.delete(document.id)
							: undefined
					}
					onSaveObservation={onSaveObservation}
					onSaveValidation={onSaveValidation}
					isAdmin={isAdmin}
				/>
			</div>
		);
	} else {
		return <Spinner size={8} />;
	}
};

const DocumentStatusLabel = styled.div`
	margin: 0 1rem 0 0;
	font-weight: 600;
`;

const DocumentContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	width: 100%;
`;

interface ExtraUserFilesProps {
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	ls: { entity: UserEntity; documents?: Map<string, DocumentEntity> };
	isEditing: boolean;
}

const ExtraUserFiles = observer((props: ExtraUserFilesProps) => {
	const { ls, isEditing } = props;
	const { t } = useTranslation(['glossary', 'ui']);

	const updateDocumentValidationMutation = useUpdateDocumentValidation();
	const updateDocumentObservationMutation = useUpdateDocumentObservation();
	const userDocumentAvailableTagsQuery = useDocumentAvailableTags('user');

	// TODO: Improve this after generic hub fetches entity by entity
	useEffect(() => {
		if (
			updateDocumentValidationMutation.isSuccess ||
			updateDocumentObservationMutation.isSuccess
		) {
			window.location.href = `${window.location.href}`;
		}
	}, [updateDocumentValidationMutation.isSuccess, updateDocumentObservationMutation.isSuccess]);

	// TODO: Emprolijar esto que basicamente
	//  hace lo mismo dos veces pero para tener todos los requeridos al principio

	const isLoading =
		updateDocumentValidationMutation.isLoading || updateDocumentObservationMutation.isLoading;

	const documents = ls.documents;

	const defaultModal = {
		isVisible: false,
		type: PModalType.INFORMATION,
		title: t('ui:Warning'),
		content: t(
			'ui:There are modified or new documents to be saved, please save the changes to the user to store these changes'
		),
		primary: {
			onClick: () => {
				setModalProps(defaultModal);
			}
		}
	};

	const [modalProps, setModalProps] = useState<PFullModalProps>(defaultModal);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-start',
				width: '100%'
			}}
		>
			<PFullModal {...modalProps} />
			{isLoading && (
				<div style={{ margin: '0 auto' }}>
					<Spinner />
				</div>
			)}
			{!isLoading && ls.entity?.extra_fields?.documents && (
				<>
					{(ls.entity.extra_fields.documents as DocumentEntity[]).map(
						(document: DocumentEntity, index: number) => {
							return (
								<>
									<DocumentContainer key={document.id}>
										<PDocumentWithSchema
											key={document.id}
											ls={ls}
											document={document}
											isEditing={isEditing}
											index={index}
										/>
									</DocumentContainer>
									<div
										style={{
											width: '100%',
											height: 1,
											marginBottom: '1rem',
											marginTop: '1rem',
											backgroundColor: 'var(--mirai-200)'
										}}
									/>
								</>
							);
						}
					)}
				</>
			)}
			{!isLoading && ls.documents && Array.from(ls.documents.values()).length > 0 && (
				<>
					{Array.from(ls.documents.values()).map((document: DocumentEntity, index) => {
						if (document.id.indexOf('TEMP_') === 0) {
							return (
								<>
									<DocumentContainer key={document.id}>
										<DocumentStatusLabel>({t('ui:NEW')})</DocumentStatusLabel>
										<PDocumentWithSchema
											key={document.id}
											ls={ls}
											document={document}
											isEditing={isEditing}
											index={index}
										/>
									</DocumentContainer>
									<div
										style={{
											width: '100%',
											height: 1,
											marginBottom: '1rem',
											marginTop: '1rem',
											backgroundColor: 'var(--mirai-200)'
										}}
									/>
								</>
							);
						} else {
							return null;
						}
					})}
				</>
			)}
			{isEditing && documents && (
				<div style={{ marginLeft: 'auto', marginRight: 'auto' }}>
					{userDocumentAvailableTagsQuery.isLoading && <Spinner />}
					{userDocumentAvailableTagsQuery.isSuccess && (
						<PDocumentTagSelector
							onItemSelect={(item) => {
								const tempId = `TEMP_${Math.random()
									.toString(36)
									.substring(2, 11)}`;

								documents.set(
									tempId,
									new DocumentEntity({
										id: tempId,
										tag: item.value,
										isBeingAdded: true
									})
								);

								setModalProps((state) => ({ ...state, isVisible: true }));
							}}
							tags={userDocumentAvailableTagsQuery.data.map((tag) => ({
								label: t(`user.${tag}`),
								value: tag
							}))}
						/>
					)}
				</div>
			)}
		</div>
	);
});

interface ExtraUserDetailsProps {
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	ls: any;
	isEditing: boolean;
}

const ExtraUserDetailsValues = ({
	ls,
	schema,
	property,
	required,
	isEditing
}: {
	//eslint-disable-next-line @typescript-eslint/no-explicit-any
	ls: any;
	schema: ExtraFieldSchemas['users'];
	property: string;
	required: boolean;
	isEditing: boolean;
}) => {
	const { t } = useTranslation('glossary');
	const label = t(`user.${property}`);
	const explanation = t([`user.${property}_desc`, '']);
	const id = `input-${property}`;
	const value = ls.entity.extra_fields[property];
	const schemaValue = schema[property];

	if (schemaValue.required === required) {
		return (
			<ExtraField
				key={property}
				isDarkVariant
				isEditing={isEditing}
				{...{
					property: property,
					required,
					label,
					explanation,
					id,
					value,
					ls,
					schemaValue
				}}
			/>
		);
	} else {
		return null;
	}
};

const ExtraUserDetails = (props: ExtraUserDetailsProps) => {
	const { ls, isEditing } = props;

	// TODO: Emprolijar esto que basicamente
	//  hace lo mismo dos veces pero para tener todos los requeridos al principio
	// agregar display:flex y column(?) al conteiner, agregar order a los childs, incluso se podría pasar un order en la definición de extra fields

	const schema = useSchemaStore((state) => state.users);

	const keys = useMemo(() => Array.from(Object.keys(schema)), [schema]);

	return useObserver(() => {
		if (ls.entity) {
			return (
				<>
					{keys.map((key) => (
						<ExtraUserDetailsValues
							key={key}
							property={key}
							ls={ls}
							schema={schema}
							required={true}
							isEditing={isEditing}
						/>
					))}
					{keys.map((key) => (
						<ExtraUserDetailsValues
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

const Vehicles = ({ vehicles }: { vehicles: VehicleEntity[] }) => {
	const history = useHistory();
	return (
		<>
			{vehicles.map((vehicle) => (
				<div key={vehicle.uvin} className={styles.leftbalancedline}>
					<PButton
						icon="info-sign"
						size={PButtonSize.SMALL}
						variant={PButtonType.SECONDARY}
						onClick={() => history.push(`/vehicles?id=${vehicle.uvin}`)}
					/>
					{vehicle.asNiceString}
				</div>
			))}
		</>
	);
};

interface UserPageProps {
	ls: UseLocalStoreEntity<UserEntity>;
	isEditing: boolean;
	isAbleToChangeRole?: boolean;
	isCreating?: boolean;
	style?: CSSProperties;
	vehicles?: VehicleEntity[];
	isAbleToAddDocuments?: boolean;
}

const ViewAndEditUser = (props: UserPageProps) => {
	const {
		ls,
		isEditing,
		isAbleToChangeRole = false,
		isCreating = false,
		style,
		vehicles = null,
		isAbleToAddDocuments = true
	} = props;
	const token = useAuthStore((state) => state.token);
	const { t } = useTranslation();
	return (
		<div className={styles.twobytwo} style={style}>
			<div className={styles.content}>
				<aside className={styles.summary}>
					<h2>{t('Personal data')}</h2>
					{t('Basic details explanation')}
				</aside>
				<section className={styles.details}>
					<BaseUserDetails
						isEditing={isEditing}
						isCreating={isCreating}
						isAbleToChangeRole={isAbleToChangeRole}
						ls={ls}
					/>
				</section>
				<div className={styles.separator} />
				<aside className={styles.summary}>
					<h2>{t('Legal information')}</h2>
					{t('Legal information explanation')}
				</aside>
				<section className={styles.details}>
					<ExtraUserDetails isEditing={isEditing} ls={ls} />
				</section>
				<div className={styles.separator} />
				{isAbleToAddDocuments && (
					<>
						<aside className={styles.summary}>
							<h2>{t('User Documentation')}</h2>
							{t('User Documentation explanation')}
						</aside>
						<section className={styles.details}>
							<ExtraUserFiles isEditing={isEditing} ls={ls} />
						</section>
						<div className={styles.separator} />
					</>
				)}
				<aside className={styles.summary}>
					<h2>{t('Password')}</h2>
					{t('Your password must have atleast 9 characters')}
				</aside>
				<section className={styles.details}>
					<PasswordChanger ls={ls} isCreating={isCreating} token={token || ''} />
				</section>
				{!isCreating && vehicles && (
					<>
						<div className={styles.separator} />
						<aside className={styles.summary}>
							<h2>{t('Vehicles')}</h2>
							{t('All vehicles either owned or operated by the user')}
						</aside>
						<section className={styles.details}>
							<Vehicles vehicles={vehicles} />
						</section>
					</>
				)}
			</div>
		</div>
	);
};

export default observer(ViewAndEditUser);
