import { Classes, FormGroup, InputGroup } from '@blueprintjs/core';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import styles from './Kanpur.module.scss';
import LabelInfo from './form/LabelInfo';

export interface PInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
	id: string;
	label?: string;
	labelInfo?: string;
	explanation?: string;
	placeholder?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	inline?: boolean;
	disabled?: boolean;
	isDarkVariant?: boolean;
	isLoading?: boolean;
	isRequired?: boolean;
	fill?: boolean;
	type?: string;
}

const PInput = (props: PInputProps) => {
	const {
		id,
		label,
		labelInfo,
		explanation,
		placeholder,
		defaultValue,
		onChange,
		inline = false,
		disabled = false,
		isDarkVariant = false,
		isLoading = false,
		isRequired = false,
		fill = false,
		type = 'text',
		...extraProps
	} = props;

	const [value, setValue] = useState<string>(
		defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ''
	);

	const onValueChange = (value: string) => {
		setValue(value);
		if (onChange) onChange(value);
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
			labelInfo={
				<LabelInfo isHidden={disabled} isRequired={isRequired} labelInfo={labelInfo} />
			}
			labelFor={id}
			inline={inline}
		>
			<InputGroup
				{...extraProps}
				className={classnames({
					[Classes.SKELETON]: isLoading,
					[styles.dark]: isDarkVariant
				})}
				id={id}
				placeholder={placeholder}
				disabled={disabled}
				onChange={(evt) => {
					onValueChange(evt.target.value);
				}}
				type={type}
				value={value}
			/>
		</FormGroup>
	);
};

PInput.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
	labelInfo: PropTypes.string,
	placeholder: PropTypes.string,
	defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	explanation: PropTypes.string,
	isLoading: PropTypes.bool,
	isDarkVariant: PropTypes.bool,
	onChange: PropTypes.func,
	disabled: PropTypes.bool,
	inline: PropTypes.bool
};

export default PInput;
