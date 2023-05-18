import { ItemPredicate, ItemRenderer, Select2 } from '@blueprintjs/select';
import { MenuItem } from '@blueprintjs/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PButton, { PButtonType, PButtonSize } from './PButton';

export interface DocumentTagType {
	label: string;
	value: string;
}

export interface PDocumentTagSelectorProps {
	tags: DocumentTagType[];
	onItemSelect: (tag: DocumentTagType) => void;
	selected?: DocumentTagType;
}

const filterDocumentTag: ItemPredicate<DocumentTagType> = (
	query,
	documentTag,
	_index,
	exactMatch
) => {
	const normalizedTitle = documentTag.label.toLowerCase();
	const normalizedQuery = query.toLowerCase();

	if (exactMatch) {
		return normalizedTitle === normalizedQuery;
	} else {
		return normalizedTitle.indexOf(normalizedQuery) >= 0;
	}
};

const renderDocumentTag: ItemRenderer<DocumentTagType> = (
	documentTag,
	{ handleClick, handleFocus, modifiers, query }
) => {
	if (!modifiers.matchesPredicate) {
		return null;
	}
	return (
		<MenuItem
			active={modifiers.active}
			disabled={modifiers.disabled}
			key={documentTag.value}
			label={''}
			onClick={handleClick}
			onFocus={handleFocus}
			roleStructure="listoption"
			text={documentTag.label}
		/>
	);
};

const PDocumentTagSelector = (props: PDocumentTagSelectorProps) => {
	const { t } = useTranslation();
	const { tags, onItemSelect, selected } = props;
	return (
		<Select2<DocumentTagType>
			items={tags}
			fill={true}
			itemPredicate={filterDocumentTag}
			itemRenderer={renderDocumentTag}
			noResults={<MenuItem disabled={true} text={t('No results')} />}
			onItemSelect={onItemSelect}
			popoverProps={{ matchTargetWidth: true }}
		>
			<PButton style={{ width: '100%', marginBottom: 10 }} variant={PButtonType.SECONDARY}>
				{selected ? String(selected) : t('Add new document by tag')}
			</PButton>
		</Select2>
	);
};

export default PDocumentTagSelector;
