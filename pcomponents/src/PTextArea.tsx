import { Classes, FormGroup, TextArea } from '@blueprintjs/core';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import styles from './Kanpur.module.scss';
import classnames from 'classnames';
import LabelInfo from './form/LabelInfo';

export interface PTextAreaProps {
	id: string;
	label: string;
	labelInfo?: string;
	explanation?: string;
	placeholder?: string;
	defaultValue?: string;
	onChange: (value: string) => void;
	inline?: boolean;
	disabled?: boolean;
	isDarkVariant?: boolean;
	isLoading?: boolean;
	isRequired?: boolean;
	style?: React.CSSProperties;
}

/**
 *
 * @param id
 * @param label
 * @param labelInfo
 * @param explanation
 * @param placeholder
 * @param defaultValue
 * @param onChange
 * @param isLoading renders component as a skeleton, for instance when the prepopulated data hasn't been fetched yet
 * @param isRequired renders an asterisk if true - label info still gets rendered if defined
 * @returns {JSX.Element}
 * @constructor
 */
const PTextArea = ({
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
	style,
	...extraProps
}: PTextAreaProps) => {
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
			helperText={!inline ? explanation : null}
			label={label}
			labelInfo={
				<LabelInfo isHidden={disabled} isRequired={isRequired} labelInfo={labelInfo} />
			}
			labelFor={id}
			inline={inline}
			style={style}
		>
			<TextArea
				className={classnames({
					[Classes.SKELETON]: isLoading,
					[styles.dark]: isDarkVariant
				})}
				id={id}
				growVertically
				placeholder={placeholder}
				value={value}
				disabled={disabled}
				onChange={(evt) => {
					onValueChange(evt.target.value);
				}}
				{...extraProps}
			/>
		</FormGroup>
	);
};

export default PTextArea;
