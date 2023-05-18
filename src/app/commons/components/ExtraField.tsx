/* eslint-disable-file @typescript-eslint/no-explicit-any */
import PBooleanInput from '@pcomponents/PBooleanInput';
import PDateInput from '@pcomponents/PDateInput';
import PFileInput from '@pcomponents/PFileInput';
import PInput from '@pcomponents/PInput';
import PNumberInput from '@pcomponents/PNumberInput';
import { SchemaItemType } from '@utm-entities/extraFields';
import { observer } from 'mobx-react';
import env from '../../../vendor/environment/env';
import { useAuthIsAdmin } from '../../modules/auth/store';

interface ExtraFieldProps {
	type: SchemaItemType;
	property: string;
	isEditing: boolean;
	isDarkVariant: boolean;
	required: boolean;
	label: string;
	explanation: string;
	id: string;
	ls: any;
	value: any;
	onlyAdmin?: boolean;
}

const ExtraField = observer((props: ExtraFieldProps) => {
	const {
		type,
		property,
		isEditing,
		isDarkVariant,
		required,
		label,
		explanation,
		id,
		ls,
		value,
		onlyAdmin
	} = props;
	const isAdmin = useAuthIsAdmin();
	if (onlyAdmin && !isAdmin) return null;
	// Transform this list of IFs into a switch case
	switch (type) {
		case SchemaItemType.String:
			return (
				<PInput
					{...{ id, label, explanation }}
					defaultValue={value}
					onChange={(value) => (ls.entity.extra_fields[property] = value)}
					isRequired={required}
					isDarkVariant={isDarkVariant}
					disabled={!isEditing}
					inline
				/>
			);
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

/*

<Checkbox
					{...{ id, label }}
					value={value}
					style={{ display: 'flex', justifyContent: 'center' }}
					alignIndicator={Alignment.RIGHT}
					onChange={(evt) => ls.entity.setExtraField(property, evt.target.checked)}
				/>


 */
