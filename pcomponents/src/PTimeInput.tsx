import LabelInfo from './form/LabelInfo';
import { TimePicker } from '@blueprintjs/datetime';
import { Classes, FormGroup } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import classnames from 'classnames';
import styles from './Kanpur.module.scss';

const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() + 1);

export interface PTimeInputProps {
	id: string;
	label: string;
	labelInfo?: string;
	explanation?: string;
	defaultValue?: Date;
	onChange: (value: Date) => void;
	disabled?: boolean;
	isDarkVariant?: boolean;
	inline?: boolean;
	isLoading?: boolean;
	isRequired?: boolean;
	amPm?: boolean;
}

const PTimeInput = ({
	id,
	label,
	labelInfo,
	explanation,
	defaultValue,
	onChange,
	disabled = false,
	isDarkVariant = false,
	inline = false,
	isLoading = false,
	isRequired = false,
	amPm = true,
	...extraProps
}: PTimeInputProps) => {
	const [value, setValue] = useState(defaultValue ? defaultValue : new Date());

	const onValueChange = (value: Date) => {
		setValue(value);
		onChange(value);
	};

	useEffect(() => {
		if (defaultValue !== undefined) {
			setValue(defaultValue);
		}
	}, [defaultValue]);

	return (
		<FormGroup
			className={classnames(styles.form, {
				[styles.dark]: isDarkVariant
			})}
			helperText={explanation}
			label={label}
			labelFor={id}
			labelInfo={
				<LabelInfo isHidden={disabled} isRequired={isRequired} labelInfo={labelInfo} />
			}
			inline={inline}
		>
			<TimePicker
				className={classnames({
					[Classes.SKELETON]: isLoading,
					[styles.dark]: isDarkVariant
				})}
				useAmPm={amPm}
				value={value}
				disabled={disabled}
				onChange={(selectedDate) => {
					if (selectedDate) {
						onValueChange(selectedDate);
					}
				}}
				{...extraProps}
			/>
		</FormGroup>
	);
};

export default PTimeInput;
