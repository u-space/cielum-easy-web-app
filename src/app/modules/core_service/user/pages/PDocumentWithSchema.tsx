import { Spinner } from '@blueprintjs/core';
import PDocument from '@pcomponents/PDocument';
import { useTranslation } from 'react-i18next';
import { showDate } from 'src/app/commons/displayUtils';
import { useAuthIsAdmin } from '../../../auth/store';
import {
	useDocumentTagSchema,
	useUpdateDocumentObservation,
	useUpdateDocumentValidation
} from '../../../document/hooks';
import { PDocumentWithSchemaProps, labelDate, showExpiredDate } from './ViewAndEditUser';

export const PDocumentWithSchema = (props: PDocumentWithSchemaProps) => {
	const { ls, document, isEditing, index } = props;
	const { t } = useTranslation(['glossary', 'ui']);
	const isAdmin = useAuthIsAdmin();
	const { tag } = document;
	const schemaQuery = useDocumentTagSchema('user', tag);

	const title = `${t(`user.${tag}`)}`;
	const label = `${t('ui:Type')}: ${t(`user.${tag}`)}, ${t(labelDate(schemaQuery.data))}${
		showExpiredDate(schemaQuery.data) ? `: ${showDate(document.valid_until)}` : ''
	}`;
	const explanation = t([`user.${tag}_desc`, '']);
	const id = `input-${tag}-${index}`;

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
					flex: 1,
					order: document.valid ? 1 : 2
				}}
			>
				<PDocument
					title={title}
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
