import { Spinner } from '@blueprintjs/core';
import PDocumentTagSelector from '@pcomponents/PDocumentTagSelector';
import { DocumentEntity } from '@utm-entities/document';
import { VehicleEntity } from '@utm-entities/vehicle';
import { observer } from 'mobx-react';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWebConsoleLogger } from '../../../../../utils';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import {
	useDocumentAvailableTags,
	useDocumentSchemas,
	useUpdateDocumentObservation,
	useUpdateDocumentValidation
} from '../../../document/hooks';
import { VehicleDocument } from './VehicleDocument';
import { AuthRole, useAuthGetRole } from 'src/app/modules/auth/store';
import { useVehicleStore } from '../store';
import { useQueryClient } from 'react-query';
import { useSchemaStore } from 'src/app/modules/schemas/store';
import { ExtraFieldSchema } from '@utm-entities/extraFields';

interface _ExtraVehicleFilesProps {
	ls: UseLocalStoreEntity<VehicleEntity>;
	isEditing: boolean;
}
const _VehicleDocuments: FC<_ExtraVehicleFilesProps> = ({ ls, isEditing }) => {
	// const { t } = useTranslation('glossary');
	const { t } = useTranslation(['ui', 'glossary']);


	const [fireRender, setFireRender] = useState(false);

	const updateDocumentValidationMutation = useUpdateDocumentValidation();
	const updateDocumentObservationMutation = useUpdateDocumentObservation();
	const vehicleDocumentAvailableTagsQuery = useDocumentAvailableTags('vehicle');
	const documentSchemaQuery = useDocumentSchemas('vehicle');

	const queryClient = useQueryClient();
	const {
		pageTake,
		pageSkip,
		sortingProperty,
		sortingOrder,
		filterProperty,
		filterMatchingText
	} = useVehicleStore((state) => ({
		pageTake: state.pageTake,
		pageSkip: state.pageSkip,
		sortingProperty: state.sortingProperty,
		sortingOrder: state.sortingOrder,
		filterProperty: state.filterProperty,
		filterMatchingText: state.filterMatchingText
	}));


	const role = useAuthGetRole();
	const filterRemoteSensor = (tag: string) => {
		if (role === AuthRole.REMOTE_SENSOR) {
			return tag === 'remote_sensor_id';
		} else {
			return true;
		}
	};

	const filterPilot = (tag: string) => {
		if (role === AuthRole.PILOT) {
			return tag !== 'remote_sensor_id';
		} else {
			return true;
		}
	};

	const canEdit = isEditing && role !== AuthRole.REMOTE_SENSOR;

	const canEditVehicleDocument = (
		role: AuthRole,
		document: DocumentEntity,
		isEditing: boolean
	) => {
		if (!isEditing) {
			return false;
		} else {
			if (role === AuthRole.ADMIN) {
				return true;
			}
			if (role === AuthRole.REMOTE_SENSOR) {
				return document.tag === 'remote_sensor_id';
			}
			if (role === AuthRole.PILOT) {
				return document.tag !== 'remote_sensor_id';
			}

			return false;
		}
	};

	const canValidateVehicleDocument = (role: AuthRole, document: DocumentEntity) => {
		if (role === AuthRole.ADMIN) {
			return true;
		}
		if (role === AuthRole.REMOTE_SENSOR) {
			return document.tag === 'remote_sensor_id';
		}
		if (role === AuthRole.PILOT) {
			return false;
		}
		return false;
	};

	const isLoading =
		updateDocumentValidationMutation.isLoading || updateDocumentObservationMutation.isLoading;

	useEffect(() => {
		if (
			updateDocumentValidationMutation.isSuccess ||
			updateDocumentObservationMutation.isSuccess
		) {
			// console.log('Update validation or observation success ');
			queryClient
				.invalidateQueries([
					'vehicles',
					pageTake,
					pageSkip,
					sortingProperty,
					sortingOrder,
					filterProperty,
					filterMatchingText
				])
				.then((a: any) => {
					// console.log('Invalidate queries', JSON.stringify(a, null, 2));
					setFireRender(!fireRender);
				});
			//document.valid = updateDocumentValidationMutation.data.data.valid;
			// window.location.href = `${window.location.href}`;
		}
	}, [updateDocumentValidationMutation.isSuccess, updateDocumentObservationMutation.isSuccess]);

	const requiredDocumentTags = (documentSchemaQuery.data && Object.keys(documentSchemaQuery.data).filter((tag: string) => documentSchemaQuery.data[tag]['__metadata']['required'])) || [];
	const isRequiredDocumentTag = (tag: string) => {
		return requiredDocumentTags.includes(tag);
	}

	return (
		ls.entity && (
			<>
				{documentSchemaQuery.data && <p> {t('Required documents')}: {requiredDocumentTags.map((t: string) => `glossary:vehicle.${t}`).map(t).join(', ')}</p>}
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
								tags={vehicleDocumentAvailableTagsQuery.data
									.filter(filterRemoteSensor)
									.filter(filterPilot)
									.map((tag: string) => {
										// console.log('map:', tag);
										return {
											label: `${t(`glossary:vehicle.${tag}`)}${isRequiredDocumentTag(tag) ? ' *' : ''}`,
											value: tag
										};
									})}
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
								if (typeof document.valid_until === 'string') {
									document.valid_until = new Date(document.valid_until);
								}
								return (
									<div
										key={`${document.id}-${String(document.valid)}`}
										style={{ order: document.valid ? 1 : 2 }}
									>
										<VehicleDocument
											ls={ls}
											document={document}
											// isEditing={canEdit}
											isEditing={canEditVehicleDocument(
												role,
												document,
												isEditing
											)}
											canValidate={canValidateVehicleDocument(role, document)}
											index={index}
										/>
									</div>
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
									<VehicleDocument
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
export const VehicleDocuments = observer(_VehicleDocuments);
