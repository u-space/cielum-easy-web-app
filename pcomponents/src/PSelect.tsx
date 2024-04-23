import { Classes, FormGroup, HTMLSelect } from '@blueprintjs/core';
import classnames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '@pcomponents/Kanpur.module.scss';
import LabelInfo from '@pcomponents/form/LabelInfo';

export interface PSelectProps {
	id: string;
	defaultValue?: string | number;
	label: string;
	inline?: boolean;
	isRequired?: boolean;
	explanation?: string;
	fill?: boolean;
	isDarkVariant?: boolean;
	disabled?: boolean;
	values: string[];
	onChange: (value: string) => void;
}

const PSelect: FC<PSelectProps> = ({
	id,
	defaultValue,
	label,
	inline,
	isRequired = false,
	explanation = '',
	fill = false,
	isDarkVariant,
	disabled = false,
	values,
	onChange
}) => {
	const { t } = useTranslation();
	const [value, setValue] = useState(
		defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ''
	);

	const onValueChange = (value: string) => {
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
		>
			<HTMLSelect
				id={id}
				className={classnames({
					// [Classes.SKELETON]: isLoading,
					[styles.dark]: isDarkVariant
				})}
				name={label}
				value={value}
				minimal
				disabled={disabled}
				onChange={(event) => onValueChange(event.currentTarget.value)}
			>
				{values.map((optionValue: string) => (
					<option key={optionValue} value={optionValue}>
						{t(optionValue)}
					</option>
				))}
			</HTMLSelect>
		</FormGroup>
	);
};

export default PSelect;
