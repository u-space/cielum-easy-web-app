import {
	Checkbox,
	Dialog,
	DialogStep,
	FormGroup,
	Icon,
	InputGroup,
	MultistepDialog,
	Overlay
} from '@blueprintjs/core';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PFileInput from './PFileInput';
import styles from './Kanpur.module.scss';
import PInput from './PInput';
import PNumberInput from './PNumberInput';
import PDateInput from './PDateInput';
import PBooleanInput from './PBooleanInput';
import LabelInfo from './form/LabelInfo';
import PButton from './PButton';
import { PButtonSize, PButtonType } from './Kanpur';
import PTextArea from './PTextArea';

const FilePanel = (props) => {
	const {
		id,
		label,
		explanation,
		file,
		setChangedFileFlag,
		setFile,
		API,
		isEditing,
		isDarkVariant
	} = props;
	return (
		<div className={classNames(styles.addFile)}>
			<div className={styles.content}>
				<section className={styles.details}>
					<PFileInput
						{...{ id, label, explanation }}
						defaultValue={file}
						onChange={(value) => {
							setChangedFileFlag(true);
							return setFile(value);
						}}
						isDarkVariant={isDarkVariant}
						isRequired={true}
						disabled={!isEditing}
						API={API}
					/>
				</section>
			</div>
		</div>
	);
};

const ExtraInfoPanel = ({
	document,
	id,
	isEditing,
	schema,
	isDarkVariant,
	isEditingOverride = false
}) => {
	const { t } = useTranslation();
	return (
		<div className={classNames(styles.addFile)}>
			<PDateInput
				key={'valid_until'}
				id={id}
				defaultValue={new Date(document['valid_until'])}
				label={t('Valid until')}
				disabled={!isEditing || isEditingOverride}
				onChange={(value) => (document['valid_until'] = value)}
				isRequired
				isDarkVariant
				inline
			/>

			{Object.keys(schema).map((key) => {
				const { type, required } = schema[key];
				if (type === 'String') {
					return (
						<PInput
							id={key}
							label={t(key)}
							defaultValue={document.extra_fields[key]}
							onChange={(value) => (document.extra_fields[key] = value)}
							isRequired={required}
							isDarkVariant={isDarkVariant}
							disabled={!isEditing || isEditingOverride}
							inline
						/>
					);
				} else if (type === 'Number') {
					return (
						<PNumberInput
							id={key}
							label={t(key)}
							defaultValue={document.extra_fields[key]}
							onChange={(value) => (document.extra_fields[key] = value)}
							isRequired={required}
							isDarkVariant={isDarkVariant}
							disabled={!isEditing || isEditingOverride}
							min={0}
							inline
						/>
					);
				} else if (type === 'Date') {
					document.extra_fields[key] = new Date();
					return (
						<PDateInput
							id={key}
							label={t(key)}
							defaultValue={new Date(document.extra_fields[key])}
							onChange={(value) => (document[key] = value)}
							isRequired={required}
							isDarkVariant={isDarkVariant}
							disabled={!isEditing || isEditingOverride}
							inline
						/>
					);
				} else if (type === 'Bool') {
					return (
						<PBooleanInput
							id={key}
							label={t(key)}
							defaultValue={document.extra_fields[key]}
							onChange={(value) => (document.extra_fields[key] = value)}
							isRequired={required}
							isDarkVariant={isDarkVariant}
							disabled={!isEditing || isEditingOverride}
							inline
						/>
					);
				} else {
					return null;
				}
			})}
			<PTextArea
				id={'observations'}
				label={t('Observations')}
				defaultValue={document.observations}
				disabled
				isDarkVariant={isDarkVariant}
				inline
			/>
		</div>
	);
};

const PDocument = (props) => {
	//property is the blablabla_file_path
	const {
		ls,
		isDarkVariant,
		isEditing,
		API,
		property,
		id,
		label,
		explanation,
		schemaStore,
		docType,
		isAdmin,
		updateDocumentValidationQuery,
		onObservationChange
	} = props;

	const [isOpen, setIsOpen] = useState(false);
	const [isShowingUploadedInformation, setShowingUploadedInformationFlag] = useState(false);
	const [hasChangedFile, setChangedFileFlag] = useState(false);
	const [document, setDocument] = useState({
		type: docType,
		valid_until: new Date(),
		extra_fields: {},
		valid: false
	});
	const [file, setFile] = useState(null);
	const [observation, setObservation] = useState('');
	const [isAddingObservation, setAddingInformationFlag] = useState(false);
	const [user, setUser] = useState('');

	/* useEffect(() => {
		if (!ls.entity.extra_fields.documents) {
			ls.entity.extra_fields.documents = [];
		}

		if (ls.entity.username) {
			setUser(ls.entity.username);
		} else if (ls.entity.owner) {
			setUser(ls.entity.owner);
		}

		const docu = ls.entity.extra_fields.documents.find((doc) => doc.type === docType);
		if (docu) {
			setDocument(docu);
			setFile(docu.downloadFileUrl);
			setObservation(docu.observations || '');
		}
		if (hasChangedFile) {
			setFile(ls.entity.extra_fields[property]);
		}
	}, [docType, ls.entity.extra_fields.documents, isOpen, ls.entity.extra_fields, property]); */

	const SeeFile = ({ file, fileUrl }) => {
		const { t } = useTranslation();
		const source = file
			? file instanceof File
				? URL.createObjectURL(file)
				: fileUrl
			: undefined;
		return (
			<div className={styles.seeFile}>
				<PButton
					onClick={() => {
						window.open(source, '_blank');
					}}
				>
					{t('View file')}
				</PButton>
				{isAdmin && (
					<PButton
						onClick={() => {
							setAddingInformationFlag(true);
						}}
					>
						{(observation !== '' && t('Edit observations')) ||
							(observation === '' && t('Add observations'))}
					</PButton>
				)}
			</div>
		);
	};

	function toggleOverlay() {
		//if is not open, create the object and the open the overlay
		setIsOpen(!isOpen);
	}

	function onCloseHandler() {
		if (isEditing) {
			delete ls.entity.extra_fields[property];
			ls.entity.extra_fields.documents = ls.entity.extra_fields.documents.filter(
				(doc) => doc.type !== docType
			);
			setDocument({
				type: docType,
				valid_until: new Date(),
				extra_fields: {}
			});
			setFile(null);
			setChangedFileFlag(false);
		}
		setIsOpen(false);
	}

	const { t } = useTranslation();
	const schema = schemaStore.documents.get(docType);

	const finalButtonProps = {
		intent: 'primary',
		onClick: () => {
			if (isEditing) {
				for (const key in schema) {
					if (document.extra_fields[key] === undefined && schema[key].required) {
						alert('Por favor, completa todos los campos obligatorios');
						return;
					}
				}
				//if exists a document of the docType first delete it then push the new one
				if (ls.entity.extra_fields.documents.find((doc) => doc.type === docType)) {
					ls.entity.extra_fields.documents = ls.entity.extra_fields.documents.filter(
						(doc) => doc.type !== docType
					);
				}
				console.log({ document, schema });
				ls.entity.extra_fields.documents.push(document);
				ls.entity.extra_fields[property] = file;
			}
			toggleOverlay();
		},
		text: t('Confirm')
	};
	const closeButtonProps = {
		intent: 'danger',
		onClick: () => {
			onCloseHandler();
		},
		text: t('Delete')
	};

	const hasAFileSelected = file !== null;
	const formGroupProps = {
		className: classNames(styles.form, {
			[styles.dark]: isDarkVariant
		}),
		style: { display: 'flex', justifyContent: 'space-between' },
		helperText: explanation,
		label: label,
		labelFor: id,
		inline: true,
		labelInfo: <LabelInfo isHidden={false} isRequired={false} labelInfo={undefined} />
	};

	if (!hasAFileSelected && !isEditing) {
		// No file is selected and can't edit
		return (
			<FormGroup {...formGroupProps}>
				<p style={{ color: 'gray' }}>{t('No file')}</p>
			</FormGroup>
		);
	} else if (isOpen) {
		/// We're editing, and the multistep is open
		return (
			<>
				<MultistepDialog
					isOpen={true}
					onClose={onCloseHandler}
					icon="add"
					title={t('Add') + ' ' + label}
					finalButtonProps={finalButtonProps}
					closeButtonProps={closeButtonProps}
					nextButtonProps={{
						disabled: file === null || file === undefined,
						text: t('Next')
					}}
					backButtonProps={{ text: t('Back') }}
					isCloseButtonShown={true}
					showCloseButtonInFooter={true}
					resetOnClose={true}
					canEscapeKeyClose={false}
					canOutsideClickClose={false}
				>
					<DialogStep
						id="select"
						panel={
							<FilePanel
								{...{
									id,
									label,
									explanation,
									file,
									setChangedFileFlag,
									setFile,
									API,
									isEditing,
									isDarkVariant
								}}
							/>
						}
						title={t('Add file')}
					/>
					<DialogStep
						id="extraInfo"
						panel={
							<ExtraInfoPanel
								{...{ id, document, isEditing, schema, isDarkVariant }}
							/>
						}
						title={t('Extra information')}
					/>
				</MultistepDialog>
				<FormGroup {...formGroupProps}>
					<InputGroup
						className={classNames({
							[styles.dark]: isDarkVariant
						})}
						id={id}
						placeholder={t('Editing file')}
						disabled={true}
						type="text"
					/>
				</FormGroup>
			</>
		);
	} else if (isShowingUploadedInformation) {
		return (
			<>
				<Dialog
					isOpen={isShowingUploadedInformation}
					onClose={() => {
						setShowingUploadedInformationFlag(false);
					}}
					title={t(label)}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '1rem'
						}}
					>
						<ExtraInfoPanel
							{...{
								document,
								id,
								isEditing,
								schema,
								isDarkVariant
							}}
							isEditingOverride={true}
						/>
						<SeeFile file={file} fileUrl={file} />
					</div>
				</Dialog>
				<Dialog
					isOpen={isAddingObservation}
					onClose={() => {
						setAddingInformationFlag(false);
					}}
					title={(observation !== '' && t('Edit observations')) || t('Add observations')}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '1rem'
						}}
					>
						<PTextArea
							id={id}
							label={t('Observations')}
							value={observation}
							onChange={setObservation}
							isDarkVariant={isDarkVariant}
							style={{
								width: '100%',
								marginBottom: '1rem'
							}}
						/>
						<PButton
							text={(observation && t('Edit observations')) || t('Add observations')}
							onClick={() => {
								onObservationChange(document.id, observation, user);
								setAddingInformationFlag(false);
							}}
							isDarkVariant={isDarkVariant}
						/>
					</div>
				</Dialog>
				<FormGroup {...formGroupProps}>
					<InputGroup
						className={classNames({
							[styles.dark]: isDarkVariant
						})}
						id={id}
						placeholder={t('Viewing selected file')}
						disabled={true}
						type="text"
					/>
				</FormGroup>
			</>
		);
	} else {
		const iconColor = hasAFileSelected ? (document.valid ? 'green' : 'red') : 'black';
		const icon = hasAFileSelected ? (document.valid ? 'tick' : 'cross') : null;
		const validateText = document.valid ? t('Devalidate') : t('Validate');
		return (
			<FormGroup {...formGroupProps} labelInfo={<Icon color={iconColor} icon={icon} />}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
					{hasAFileSelected && (
						<>
							{!isEditing && isAdmin && (
								<PButton
									variant={PButtonType.SECONDARY}
									size={PButtonSize.SMALL}
									text={validateText}
									disabled={updateDocumentValidationQuery.isLoading}
									onClick={() => {
										updateDocumentValidationQuery.mutate({
											docId: document.id,
											valid: !document.valid
										});
									}}
								/>
							)}
							<PButton
								variant={PButtonType.SECONDARY}
								size={PButtonSize.SMALL}
								text={t('View')}
								onClick={() => {
									setShowingUploadedInformationFlag(true);
								}}
							/>
						</>
					)}
					{isEditing && (
						<PButton
							variant={PButtonType.SECONDARY}
							size={PButtonSize.SMALL}
							text={t('Upload')}
							onClick={() => {
								toggleOverlay();
							}}
						/>
					)}
				</div>
			</FormGroup>
		);
	}
};
export default PDocument;
