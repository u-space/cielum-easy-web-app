import { Classes, FormGroup, NumericInput, NumericInputProps } from '@blueprintjs/core';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import styles from './Kanpur.module.scss';
import classnames from 'classnames';
import LabelInfo from './form/LabelInfo';

export interface PNumberInputProps extends NumericInputProps {
	id: string;
	label: string;
	labelInfo?: string;
	explanation?: string;
	placeholder?: string;
	defaultValue: number;
	onChange: (value: number) => void;
	inline?: boolean;
	isLoading?: boolean;
	isRequired?: boolean;
	min?: number;
	disabled?: boolean;
	isDarkVariant?: boolean;
}

const PNumberInput = (props: PNumberInputProps) => {
	const {
		id,
		label,
		labelInfo,
		explanation,
		placeholder,
		defaultValue,
		onChange,
		disabled = false,
		inline = false,
		isLoading = false,
		isRequired = false,
		isDarkVariant = false,
		min,
		...extraProps
	} = props;
	const [value, setValue] = useState(defaultValue);

	const onValueChange = (value: number) => {
		setValue(value);
		onChange(value);
	};

	useEffect(() => {
		if (defaultValue) {
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
			labelInfo={<LabelInfo isRequired={isRequired} labelInfo={labelInfo} isHidden={false} />}
			labelFor={id}
			inline={inline}
		>
			<NumericInput
				className={classnames({
					[Classes.SKELETON]: isLoading,
					[styles.dark]: isDarkVariant
				})}
				id={id}
				buttonPosition={'none'}
				placeholder={placeholder}
				value={value}
				allowNumericCharactersOnly
				disabled={disabled}
				fill
				min={min}
				minorStepSize={null}
				onValueChange={(value) => {
					if (!isNaN(value)) onValueChange(value);
				}}
				{...extraProps}
			/>
		</FormGroup>
	);
};

PNumberInput.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
	labelInfo: PropTypes.string,
	placeholder: PropTypes.string,
	defaultValue: PropTypes.number,
	explanation: PropTypes.string,
	isLoading: PropTypes.bool,
	isDarkVariant: PropTypes.bool
};

export default PNumberInput;
