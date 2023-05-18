import { HTMLSelect } from '@blueprintjs/core';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { FC, FunctionComponent, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import { PButtonSize, PButtonType } from '@pcomponents/PButton';
import PButton from '@pcomponents/PButton';
import { useHistory } from 'react-router-dom';
import { UseGenericFilterableAndPaginableSliceStoreType } from '../../stores/FilterableAndPaginableSlice';
import CardGroup from '../../layouts/dashboard/menu/CardGroup';
import styles from './FilterAndOrderSearchTools.module.scss';
import { shallow } from 'zustand/shallow';

interface FilterAndOrderSearchToolsProps {
	useStore: UseGenericFilterableAndPaginableSliceStoreType;
	entityName: string;
	queryableProps: string[];
	extra?: FunctionComponent;
}

const FilterAndOrderSearchTools: FC<FilterAndOrderSearchToolsProps> = ({
	useStore,
	entityName,
	queryableProps,
	extra
}) => {
	const { t } = useTranslation();
	const history = useHistory();
	const Extra = extra;

	const store = useStore(
		(state) => ({
			filterMatchingText: state.filterMatchingText,
			filterProperty: state.filterProperty,
			setFilterByText: state.setFilterByText,
			setFilterProperty: state.setFilterProperty,
			sortingProperty: state.sortingProperty,
			setSortingOrder: state.setSortingOrder,
			setSortingProperty: state.setSortingProperty,
			sortingOrder: state.sortingOrder
		}),
		shallow
	);

	const [filter, setFilter] = useState(store.filterMatchingText);

	const updateFilter = useRef(
		_.debounce(store.setFilterByText, 500, {
			trailing: true,
			leading: false
		})
	);

	const setFilterText = (text: string) => {
		setFilter(text);
		updateFilter.current(text);
	};

	useEffect(() => {
		setFilter(store.filterMatchingText);
	}, [store.filterMatchingText]);

	return (
		<>
			<CardGroup header={`Find a specific ${entityName}`}>
				<div className={styles.search}>
					<div className={styles.liner}>
						<PInput
							onChange={setFilterText}
							defaultValue={filter}
							id="search"
							placeholder={t(`Search for a ${entityName}`)}
						/>
						{filter && filter.length > 0 && (
							<PButton
								style={{
									position: 'absolute',
									right: 24
								}}
								onClick={() => {
									setFilterText('');
									history.replace(`/${entityName}s`);
								}}
								icon="cross"
								variant={PButtonType.SECONDARY}
								size={PButtonSize.EXTRA_SMALL}
							/>
						)}
					</div>
					<div className={styles.liner}>
						{t('Filter by')}
						<HTMLSelect
							id="filter"
							name="filterProperty"
							className={styles.property}
							value={store.filterProperty}
							onChange={(event) => store.setFilterProperty(event.currentTarget.value)}
						>
							{queryableProps.map((prop) => {
								if (prop.includes('date')) {
									// pass
								} else {
									return (
										<option key={prop} value={prop}>
											{t(`glossary:${entityName}.${prop}`)}
										</option>
									);
								}
							})}
						</HTMLSelect>
					</div>
				</div>
			</CardGroup>
			<CardGroup header="Order the results">
				<div className={styles.search}>
					<div className={styles.order}>
						<p>{t('By')}</p>
						<HTMLSelect
							id="sorter"
							name="UserSorter"
							className={styles.property}
							value={store.sortingProperty}
							minimal
							onChange={(event) =>
								store.setSortingProperty(event.currentTarget.value)
							}
						>
							{queryableProps.map((prop) => (
								<option key={prop} value={prop}>
									{t(`glossary:${entityName}.${prop}`)}
								</option>
							))}
						</HTMLSelect>
						<p>{t('in order')}</p>
						<HTMLSelect
							id="sorter"
							name="UserSortingOrder"
							className={styles.property}
							value={store.sortingOrder}
							minimal
							onChange={(event) =>
								store.setSortingOrder(event.currentTarget.value as 'ASC' | 'DESC')
							}
						>
							<option value="ASC">{t('glossary:ascending')}</option>
							<option value="DESC">{t('glossary:descending')}</option>
						</HTMLSelect>
					</div>
				</div>
			</CardGroup>
			{Extra && <Extra />}
		</>
	);
};

export default observer(FilterAndOrderSearchTools);
