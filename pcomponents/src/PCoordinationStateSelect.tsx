import { FormGroup, HTMLSelect } from '@blueprintjs/core';
import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Kanpur.module.scss';
import LabelInfo from './form/LabelInfo';
import { CoordinationState } from '@flight-request-entities/coordination';

export interface PCoordinationStateSelectProps {
	id: string;
	defaultValue?: CoordinationState;
	inline?: boolean;
	isRequired?: boolean;
	explanation?: string;
	fill?: boolean;
	isDarkVariant?: boolean;
	disabled?: boolean;
	onChange: (value: CoordinationState) => void;
}

const PCoordinationStateSelect = ({
	id,
	defaultValue,
	inline,
	isRequired = false,
	explanation = '',
	fill,
	isDarkVariant,
	disabled = false,
	onChange
}: PCoordinationStateSelectProps) => {
	const { t } = useTranslation(['glossary']);
	const [value, setValue] = useState(
		defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ''
	);

	const onValueChange = (value: CoordinationState) => {
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
			label={t('glossary:coordination.state')}
			labelInfo={<LabelInfo isHidden={disabled} isRequired={isRequired} />}
			labelFor={id}
			inline={inline}
		>
			<HTMLSelect
				id={id}
				name="CoordinationState"
				value={value}
				minimal
				disabled={disabled}
				onChange={(event) => onValueChange(event.currentTarget.value as CoordinationState)}
			>
				{Object.values(CoordinationState).map((state) => (
					<option key={state} value={state}>
						{t(`glossary:coordination.states.${state}`)}
					</option>
				))}
			</HTMLSelect>
		</FormGroup>
	);
};

export default PCoordinationStateSelect;
