import { Spinner } from '@blueprintjs/core';
import PDocumentTagSelector from '@pcomponents/PDocumentTagSelector';
import { DocumentEntity } from '@utm-entities/document';
import { VehicleEntity } from '@utm-entities/vehicle';
import { observer } from 'mobx-react';
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getWebConsoleLogger } from '../../../../../utils';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import {
	useDocumentAvailableTags,
	useUpdateDocumentObservation,
	useUpdateDocumentValidation
} from '../../../document/hooks';
import { PDocumentWithSchema } from './PDocumentWithSchemaProps';
import { AuthRole, useAuthGetRole } from 'src/app/modules/auth/store';

interface _ExtraVehicleFilesProps {
	ls: UseLocalStoreEntity<VehicleEntity>;
	isEditing: boolean;
}
const _VehicleDocuments: FC<_ExtraVehicleFilesProps> = ({ ls, isEditing }) => {
	const { t } = useTranslation('glossary');

	const updateDocumentValidationMutation = useUpdateDocumentValidation();
	const updateDocumentObservationMutation = useUpdateDocumentObservation();
	const vehicleDocumentAvailableTagsQuery = useDocumentAvailableTags('vehicle');

	const role = useAuthGetRole();
	const filterRemoteSensor = (tag: string) => {
		// return true;
		if (role === AuthRole.REMOTE_SENSOR) {
			console.log('filterRemoteSensor', tag, tag === 'remote_sensor_id');
			return tag === 'remote_sensor_id';
		} else {
			return true;
		}
	};

	const canEdit = isEditing && role !== AuthRole.REMOTE_SENSOR;

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
								tags={vehicleDocumentAvailableTagsQuery.data
									.filter(filterRemoteSensor)
									.map((tag: string) => {
										console.log('map:', tag);
										return {
											label: t(`vehicle.${tag}`),
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
								return (
									<div
										key={document.id}
										style={{ order: document.valid ? 1 : 2 }}
									>
										<PDocumentWithSchema
											// key={document.id}
											ls={ls}
											document={document}
											isEditing={canEdit}
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
export const VehicleDocuments = observer(_VehicleDocuments);
