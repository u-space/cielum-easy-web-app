import { Classes, FormGroup, InputGroup, Intent } from '@blueprintjs/core';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { ReactNode, useEffect, useState } from 'react';
import styles from './Kanpur.module.scss';
import LabelInfo from './form/LabelInfo';
import PTooltip from './PTooltip';

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
	minLength?: number;
	maxLength?: number;
	children?: ReactNode;
	hasTooltip?: boolean;
}

interface IWithTooltip {
	hasTooltip: boolean;
	content: string;
	children: React.ReactNode;
}

const WithTooltip: React.FC<IWithTooltip> = ({ hasTooltip, content, children }) => {
	return hasTooltip ? <PTooltip content={content}>{children}</PTooltip> : <>{children}</>;
};

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
		minLength,
		maxLength,
		hasTooltip,
		children, // Only used for showing translated error messages for too short inputs
		...extraProps
	} = props;

	const [value, _setValue] = useState<string>(
		defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ''
	);
	const [previousValue, setPreviousValue] = useState<string>(value);
	const [isFocused, setFocusedFlag] = useState<boolean>(false);

	const setValue = (value: string) => {
		_setValue((previousValue) => {
			setPreviousValue(previousValue);
			return value;
		});
	};

	const onValueChange = (value: string) => {
		setValue(value);
		if (onChange) onChange(value);
	};

	useEffect(() => {
		if (defaultValue !== undefined && defaultValue !== null) {
			setValue(String(defaultValue));
		}
	}, [defaultValue]);

	let intent: Intent = Intent.NONE;
	if (isRequired && value.length === 0 && previousValue.length > 0) intent = Intent.DANGER;
	const minLengthError = minLength && value.length > 0 && value.length < minLength;
	if (minLengthError) intent = Intent.DANGER;

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
			<WithTooltip hasTooltip={!!hasTooltip && !!explanation} content={explanation || ''}>
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
					intent={intent}
					minLength={minLength}
					maxLength={maxLength}
					onFocus={() => setFocusedFlag(true)}
					onBlur={() => setFocusedFlag(false)}
				/>
			</WithTooltip>
			{!isFocused && !disabled && minLengthError && children}
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
