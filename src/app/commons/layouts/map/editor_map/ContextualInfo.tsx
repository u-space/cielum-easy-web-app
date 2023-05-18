import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import PButton from '@pcomponents/PButton';
import PNumberInput from '@pcomponents/PNumberInput';
import { FC } from 'react';
import PDateInput from '@pcomponents/PDateInput';

export interface ContextualInfoProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	entity: any;
	entityName: string;
	actionLabel?: string;
	actionFn?: () => void;
	editable?: boolean;
	hiddenProps?: string[];
}

const ContextualInfo: FC<ContextualInfoProps> = (props) => {
	const { entity, entityName, actionLabel, actionFn, editable = true, hiddenProps = [] } = props;
	const { t } = useTranslation('glossary');

	const toDisplay = [];
	for (const prop in entity) {
		if (!hiddenProps.includes(prop)) {
			const key = prop;
			const id = `${entityName}.${prop}`;
			const label = t(`glossary:${entityName}.${prop}`);
			if (typeof entity[prop] === 'string') {
				toDisplay.push(
					<PInput
						{...{ key, id, label }}
						defaultValue={String(entity[prop])}
						placeholder={''}
						onChange={(value: string) => (entity[prop] = value)}
						isRequired
						disabled={!editable}
					/>
				);
			} else if (typeof entity[prop] === 'number') {
				toDisplay.push(
					<PNumberInput
						{...{ key, id, label }}
						defaultValue={Number(entity[prop])}
						isRequired
						onChange={(value: number) => (entity[prop] = value)}
						disabled={!editable}
					/>
				);
			} else if (entity[prop] instanceof Date) {
				toDisplay.push(
					<PDateInput
						{...{ key, id, label }}
						labelInfo={undefined}
						explanation={undefined}
						placeholder={undefined}
						defaultValue={entity[prop]}
						onChange={(value: Date) => (entity[prop] = value)}
						isRequired
						isTime
						disabled={!editable}
					/>
				);
			}
		}
	}
	return (
		<>
			{toDisplay}
			{actionLabel && actionFn && <PButton onClick={actionFn}>{actionLabel}</PButton>}
		</>
	);
};

export default ContextualInfo;
