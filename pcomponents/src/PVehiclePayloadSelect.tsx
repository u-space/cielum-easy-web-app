import { Intent, Label, MenuItem, TagProps } from '@blueprintjs/core';
import { ItemRenderer, MultiSelect2 } from '@blueprintjs/select';
import { PayloadType, payloadTypes } from '@utm-entities/payloadType';
import classNames from 'classnames';
import styles from './Kanpur.module.scss';

// TODO: Add proper properties

export interface PVehiclePayloadSelectProps {
	id: string;
	selected?: PayloadType[];
	onItemSelect: (payloadType: PayloadType) => void;
	onItemDelete: (index: number) => void;
	label: string;
	isDarkVariant?: boolean;
	fill?: boolean;
	disabled?: boolean;
	onClick?: () => void;
}

const isSelected = (payloadType: PayloadType) => {
	return (selected: PayloadType[]) => {
		return selected.includes(payloadType);
	};
};

const PVehiclePayloadSelect = (props: PVehiclePayloadSelectProps) => {
	const {
		id,
		selected = [],
		onItemSelect,
		disabled = false,
		onClick,
		onItemDelete,
		label,
		isDarkVariant = false,
		fill = false
	} = props;

	const PayloadTypeMultiSelect = MultiSelect2.ofType<PayloadType>();

	const renderPayloadType: ItemRenderer<PayloadType> = (
		payloadType,
		{ handleClick, modifiers, query }
	) => {
		if (!modifiers.matchesPredicate) {
			return null;
		}
		return (
			<MenuItem
				id={id}
				active={modifiers.active}
				selected={isSelected(payloadType)(selected)}
				disabled={modifiers.disabled}
				key={payloadType.id}
				onClick={handleClick}
				shouldDismissPopover={false}
				text={`${payloadType?.name ?? ''}`}
			/>
		);
	};

	const handleTagRemove = (_tag: React.ReactNode, index: number) => {
		onItemDelete(index);
	};
	const INTENTS = [Intent.NONE, Intent.PRIMARY, Intent.SUCCESS, Intent.DANGER, Intent.WARNING];
	const getTagProps = (_value: React.ReactNode, index: number): TagProps => ({
		intent: INTENTS[index % INTENTS.length],
		minimal: true
	});
	const tagRenderer = (payloadType: PayloadType) => payloadType?.name ?? ' ';

	const itemSelectHandler = (payloadType: PayloadType) => {
		if (selected.find((payload) => payloadType.id === payload.id)) {
			return;
		}
		onItemSelect(payloadType);
	};

	return (
		<div className={classNames(styles.form, styles.dark)}>
			<Label>{label}</Label>
			<PayloadTypeMultiSelect
				className={classNames(styles.fixedWidth, styles.dark)}
				disabled={disabled}
				placeholder={disabled ? '-' : 'Select Payloads'}
				selectedItems={selected}
				tagRenderer={tagRenderer}
				itemRenderer={renderPayloadType}
				onItemSelect={itemSelectHandler}
				tagInputProps={{
					onRemove: handleTagRemove,
					tagProps: getTagProps
				}}
				items={payloadTypes}
			/>
		</div>
	);
};

export default PVehiclePayloadSelect;
