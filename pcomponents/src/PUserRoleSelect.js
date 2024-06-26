import { FormGroup, HTMLSelect } from '@blueprintjs/core';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@pcomponents/Kanpur.module.scss';
import LabelInfo from '@pcomponents/form/LabelInfo';

const PUserRoleSelect = ({
	id,
	defaultValue,
	label,
	inline,
	isRequired = false,
	explanation = '',
	fill = false,
	isDarkVariant,
	disabled = false,
	onChange
}) => {
	const { t } = useTranslation();
	const [value, setValue] = useState(
		defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ''
	);

	const onValueChange = (value) => {
		setValue(value);
		onChange(value);
	};

	useEffect(() => {
		if (defaultValue !== undefined && defaultValue !== null) {
			setValue(String(defaultValue));
		}
	}, [defaultValue]);

	return (
		<FormGroup
			className={classnames(styles.form, {
				[styles.dark]: isDarkVariant,
				[styles.fill]: fill
			})}
			helperText={!inline ? explanation : null}
			label={label}
			labelInfo={<LabelInfo isHidden={disabled} isRequired={isRequired} />}
			labelFor={id}
			inline={inline}
			fill
		>
			<HTMLSelect
				id={id}
				name="UserRole"
				value={value}
				minimal
				disabled={disabled}
				onChange={(event) => onValueChange(event.currentTarget.value)}
			>
				<option value="pilot">{t('PILOT')}</option>
				<option value="monitor">{t('MONITOR')} </option>
				<option value="admin">{t('ADMIN')}</option>
				<option value="coa">{t('COA')}</option>
				<option value="remote_sensor">{t('REMOTE_SENSOR')}</option>
			</HTMLSelect>
		</FormGroup>
	);
};

export default PUserRoleSelect;
