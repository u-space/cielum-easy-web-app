/* eslint-disable-file @typescript-eslint/no-explicit-any */
import PBooleanInput from '@pcomponents/PBooleanInput';
import PDateInput from '@pcomponents/PDateInput';
import PFileInput from '@pcomponents/PFileInput';
import PInput from '@pcomponents/PInput';
import PNumberInput from '@pcomponents/PNumberInput';
import PSelect from '@pcomponents/PSelect';
import { SchemaItem, SchemaItemType } from '@utm-entities/extraFields';
import { observer } from 'mobx-react';
import env from '../../../vendor/environment/env';
import { useAuthIsAdmin } from '../../modules/auth/store';
import { useTranslation } from 'react-i18next';

interface ExtraFieldProps {
	property: string;
	isEditing: boolean;
	isDarkVariant: boolean;
	required: boolean;
	label: string;
	explanation: string;
	id: string;
	ls: any;
	value: any;
	schemaValue: SchemaItem;
}

const ExtraField = observer((props: ExtraFieldProps) => {
	const {
		property,
		isEditing,
		isDarkVariant,
		required,
		label,
		explanation,
		id,
		ls,
		value,
		schemaValue
	} = props;

	const {
		type,
		onlyVisibleForAdmin: onlyAdmin,
		min_lenght: minLength,
		max_lenght: maxLength,
		values
	} = schemaValue;
	const { t } = useTranslation();
	const isAdmin = useAuthIsAdmin();
	if (onlyAdmin && !isAdmin) return null;
	switch (type) {
		case SchemaItemType.String:
			if (values) {
				return (
					<PSelect
						{...{ id, label, explanation }}
						defaultValue={value}
						onChange={(value) => (ls.entity.extra_fields[property] = value)}
						isRequired={required}
						isDarkVariant={isDarkVariant}
						disabled={!isEditing}
						inline
						values={values}
					/>
				);
			} else {
				return (
					<PInput
						{...{ id, label, explanation }}
						defaultValue={value}
						onChange={(value) => (ls.entity.extra_fields[property] = value)}
						isRequired={required}
						isDarkVariant={isDarkVariant}
						disabled={!isEditing}
						inline
						minLength={minLength}
						maxLength={maxLength}
					>
						<p style={{ textAlign: 'right', fontSize: '0.9em' }}>
							{t('Min length is')} {minLength} (
							<strong>{(ls.entity.extra_fields[property] || '').length}</strong>)
						</p>
					</PInput>
				);
			}
		case SchemaItemType.Number:
			return (
				<PNumberInput
					{...{ id, label, explanation }}
					defaultValue={value}
					onChange={(value) => (ls.entity.extra_fields[property] = value)}
					isRequired={required}
					isDarkVariant={isDarkVariant}
					disabled={!isEditing}
					min={0}
					inline
				/>
			);
		case SchemaItemType.Date:
			return (
				<PDateInput
					{...{ id, label, explanation }}
					defaultValue={value}
					onChange={(value) => (ls.entity.extra_fields[property] = value)}
					isRequired={required}
					isDarkVariant={isDarkVariant}
					disabled={!isEditing}
					inline
				/>
			);
		case SchemaItemType.File:
			return (
				<PFileInput
					{...{ id, label, explanation }}
					defaultValue={ls.entity.extra_fields[property] || value}
					onChange={(value) => (ls.entity.extra_fields[property] = value)}
					isDarkVariant={isDarkVariant}
					isRequired={required}
					disabled={!isEditing}
					API={env.core_api}
				/>
			);
		case SchemaItemType.Bool:
			return (
				<PBooleanInput
					{...{ id, label, explanation }}
					defaultValue={value}
					onChange={(value) => (ls.entity.extra_fields[property] = value)}
					isRequired={required}
					isDarkVariant={isDarkVariant}
					disabled={!isEditing}
					inline
				/>
			);
		default:
			console.error('Type not supported: ', type); // eslint-disable-line no-console
			throw new Error('Invalid type supplied to components/ExtraField');
	}
});

export default ExtraField;
