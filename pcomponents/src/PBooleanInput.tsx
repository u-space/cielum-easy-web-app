import { Classes, FormGroup, InputGroup } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Kanpur.module.scss';
import classnames from 'classnames';
import PButton, { PButtonSize, PButtonType } from './PButton';
import LabelInfo from './form/LabelInfo';

export interface PBooleanInputProps {
	id: string;
	label: string;
	labelInfo?: string;
	explanation?: string;
	defaultValue?: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	isLoading?: boolean;
	isRequired?: boolean;
	isDarkVariant?: boolean;
	inline?: boolean;
	fill?: boolean;
	placeholder?: string;
}

const PBooleanInput = ({
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
	...extraProps
}: PBooleanInputProps) => {
	const { t } = useTranslation();
	const [value, setValue] = useState(defaultValue);

	const onValueChange = (value: boolean) => {
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
			{disabled && (
				<InputGroup
					className={classnames({
						[Classes.SKELETON]: isLoading,
						[styles.dark]: isDarkVariant
					})}
					id={id}
					placeholder={placeholder}
					value={value ? t('Yes') : t('No')}
					disabled={true}
					{...extraProps}
				/>
			)}
			{!disabled && (
				<div className={classnames(styles.boolean, { [styles.hidden]: disabled })}>
					<PButton
						id={`${id}-yes`}
						size={PButtonSize.SMALL}
						style={{ fontWeight: value ? '900' : '300' }}
						variant={value ? PButtonType.PRIMARY : PButtonType.SECONDARY}
						onClick={() => {
							onValueChange(true);
						}}
					>
						{t('Yes').toUpperCase()}
					</PButton>
					<PButton
						size={PButtonSize.SMALL}
						id={`${id}-no`}
						style={{ fontWeight: !value ? '900' : '300' }}
						variant={!value ? PButtonType.PRIMARY : PButtonType.SECONDARY}
						onClick={() => {
							onValueChange(false);
						}}
					>
						{t('No').toUpperCase()}
					</PButton>
				</div>
			)}
		</FormGroup>
	);
};

export default PBooleanInput;
