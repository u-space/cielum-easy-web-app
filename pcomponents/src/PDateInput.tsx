import LabelInfo from './form/LabelInfo';
import { DateInput, TimePrecision } from '@blueprintjs/datetime';
import { Classes, FormGroup } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import classnames from 'classnames';
import styles from './Kanpur.module.scss';

const maxDate = new Date();
maxDate.setFullYear(maxDate.getFullYear() + 5);

export interface PDateInputProps {
	id: string;
	label: string;
	labelInfo?: string;
	explanation?: string;
	placeholder?: string;
	defaultValue?: Date;
	onChange: (value: Date) => void;
	disabled?: boolean;
	isDarkVariant?: boolean;
	inline?: boolean;
	isLoading?: boolean;
	isRequired?: boolean;
	isTime?: boolean;
	isDate?: boolean;
}

const PDateInput = ({
	id,
	label,
	labelInfo,
	explanation,
	placeholder,
	defaultValue,
	onChange,
	disabled = false,
	isDarkVariant = false,
	inline = false,
	isLoading = false,
	isRequired = false,
	isTime = false,
	isDate = true,
	...extraProps
}: PDateInputProps) => {
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
			<DateInput
				className={classnames({
					[Classes.SKELETON]: isLoading,
					[styles.dark]: isDarkVariant
				})}
				fill
				inputProps={{ id: id }}
				formatDate={(date) => {
					let hours = String(date.getHours());
					if (Number(hours) < 10) hours = `0${hours}`;
					let minutes = String(date.getMinutes());
					if (Number(minutes) < 10) minutes = `0${minutes}`;
					let seconds = String(date.getSeconds());
					if (Number(seconds) < 10) seconds = `0${seconds}`;
					const time = `${hours}:${minutes}:${seconds}`;

					return `${isDate ? date.toLocaleDateString() + ' ' : ''}${isTime ? time : ''}`;
				}}
				parseDate={(_date) => {
					const date = _date.split('/');
					if (date && date.length === 3) {
						return new Date(date[1] + '/' + date[0] + '/' + date[2]);
					} else {
						return new Date();
					}
				}}
				placeholder={placeholder}
				value={value}
				minDate={new Date(1577833200000)}
				maxDate={maxDate}
				disabled={disabled}
				canClearSelection={false}
				timePrecision={isTime ? TimePrecision.MINUTE : undefined}
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

export default PDateInput;
