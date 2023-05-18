import { Intent, MenuItem, TagProps } from '@blueprintjs/core';
import { ItemRenderer, MultiSelect2 } from '@blueprintjs/select';
import classNames from 'classnames';
import styles from './Kanpur.module.scss';
import { ReactNode } from 'react';

// TODO: Add proper properties

export interface PCoordinatorTypeSelectProps {
	selected?: string[];
	onItemSelect: (coordinatorType: string) => void;
	onRemove: (value: string, index: number) => void;
	isDarkVariant?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	coordinatorTypes: string[];
}

const isSelected = (coordinatorType: string) => {
	return (selected: string[]) => {
		return selected.includes(coordinatorType);
	};
};

const PCoordinatorTypeSelect = (props: PCoordinatorTypeSelectProps) => {
	const { selected = [], onItemSelect, onRemove, coordinatorTypes } = props;

	const PCoordinatorTypeMultiSelect = MultiSelect2.ofType<string>();

	const renderPayloadType: ItemRenderer<string> = (
		coordinatorType,
		{ handleClick, modifiers, query }
	) => {
		if (!modifiers.matchesPredicate) {
			return null;
		}
		return (
			<MenuItem
				active={modifiers.active}
				selected={isSelected(coordinatorType)(selected)}
				disabled={modifiers.disabled}
				key={coordinatorType}
				onClick={handleClick}
				shouldDismissPopover={false}
				text={`${coordinatorType}`}
			/>
		);
	};

	const INTENTS = [Intent.NONE, Intent.PRIMARY, Intent.SUCCESS, Intent.DANGER, Intent.WARNING];
	const getTagProps = (_value: ReactNode, index: number): TagProps => ({
		intent: INTENTS[index % INTENTS.length],
		minimal: true
	});
	const tagRenderer = (coordinatorType: string) => coordinatorType;

	return (
		<PCoordinatorTypeMultiSelect
			className={classNames(styles.dark)}
			selectedItems={selected}
			tagRenderer={tagRenderer}
			itemRenderer={renderPayloadType}
			onItemSelect={onItemSelect}
			tagInputProps={{
				tagProps: getTagProps
			}}
			onRemove={onRemove}
			items={coordinatorTypes}
		/>
	);
};

export default PCoordinatorTypeSelect;
