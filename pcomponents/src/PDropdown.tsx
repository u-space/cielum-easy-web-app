import { Classes, FormGroup, HTMLSelect } from '@blueprintjs/core';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import styles from './Kanpur.module.scss';
import classnames from 'classnames';
import LabelInfo from './form/LabelInfo';

export interface PDropdownProps {
	id: string;
	label: string;
	labelInfo?: string;
	explanation?: string;
	defaultValue?: string;
	options: { value: any; label: string }[];
	onChange: (value: any) => void;
	disabled?: boolean;
	isLoading?: boolean;
	isRequired?: boolean;
	isDarkVariant?: boolean;
	inline?: boolean;
}

const PDropdown = ({
	id,
	label,
	labelInfo,
	explanation,
	defaultValue,
	options,
	onChange,
	disabled = false,
	isLoading = false,
	isRequired = false,
	isDarkVariant = false,
	inline = false,
	...extraProps
}: PDropdownProps) => {
	const [value, setValue] = useState(defaultValue ? String(defaultValue) : '');

	const onValueChange = (value: string) => {
		setValue(value);
		onChange(value);
	};

	useEffect(() => {
		if (defaultValue) {
			setValue(String(defaultValue));
		}
	}, [defaultValue]);

	return (
		<FormGroup
			className={classnames(styles.form, {
				[styles.dark]: isDarkVariant
			})}
			helperText={explanation}
			label={label}
			labelInfo={
				<LabelInfo isHidden={disabled} labelInfo={labelInfo} isRequired={isRequired} />
			}
			labelFor={id}
			inline={inline}
		>
			<HTMLSelect
				className={classnames(styles.select, {
					[Classes.SKELETON]: isLoading,
					[styles.dark]: isDarkVariant
				})}
				id={id}
				disabled={disabled}
				value={value}
				fill
				onChange={(evt) => onValueChange(evt.currentTarget.value)}
				{...extraProps}
			>
				{options.map((option) => {
					return (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					);
				})}
			</HTMLSelect>
		</FormGroup>
	);
};

export default PDropdown;
