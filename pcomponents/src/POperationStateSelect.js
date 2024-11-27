import { FormGroup, HTMLSelect } from '@blueprintjs/core';
import { OperationStateEnum } from '@utm-entities/v2/model/operation';
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
	onChange,
	validAllTransitions = false,
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


	const validTransitions = (currentState) => {
		if (validAllTransitions) {
			return Object.values(OperationStateEnum);
		} else {
			const validTransitions = [currentState];
			if (currentState === OperationStateEnum.PENDING) {
				validTransitions.push(OperationStateEnum.CLOSED);
				validTransitions.push(OperationStateEnum.PROPOSED);
			} else if (currentState === OperationStateEnum.ACTIVATED) {
				validTransitions.push(OperationStateEnum.CLOSED);
			} else if (currentState === OperationStateEnum.ACCEPTED) {
				validTransitions.push(OperationStateEnum.CLOSED);
			} else {
				console.log('invalid state', currentState);
			}
			return validTransitions;
		}

	}
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
				{Object.values(OperationStateEnum).map((operationState) => (
					<option disabled={!validTransitions(value).includes(operationState)} key={operationState} value={operationState}>
						{t(operationState)}
					</option>
				))}

			</HTMLSelect>
		</FormGroup>
	);
};

export default POperationStateSelect;
