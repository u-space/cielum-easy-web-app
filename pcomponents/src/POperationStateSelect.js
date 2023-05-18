import { FormGroup, HTMLSelect } from '@blueprintjs/core';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Kanpur.module.scss';
import LabelInfo from './form/LabelInfo';

const POperationStateSelect = ({
	id,
	defaultValue,
	label,
	inline,
	isRequired = false,
	explanation = '',
	fill,
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
				name="OperationState"
				value={value}
				minimal
				disabled={disabled}
				onChange={(event) => onValueChange(event.currentTarget.value)}
			>
				<option value="PROPOSED">{t('PROPOSED')}</option>
				<option value="PENDING">{t('PENDING')} </option>
				<option value="ACCEPTED">{t('ACCEPTED')}</option>
				<option value="NOT_ACCEPTED">{t('NOT_ACCEPTED')}</option>
				<option value="ACTIVATED">{t('ACTIVATED')}</option>
				<option value="CLOSED">{t('CLOSED')}</option>
				{/*<option value="NONCONFORMING">{t('NONCONFORMING')}</option>*/}
				<option value="ROGUE">{t('ROGUE')}</option>
			</HTMLSelect>
		</FormGroup>
	);
};

export default POperationStateSelect;
