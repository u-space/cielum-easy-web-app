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
	searchableProps: string[];
	orderableProps: string[];
	extra?: FunctionComponent;
}

const FilterAndOrderSearchTools: FC<FilterAndOrderSearchToolsProps> = ({
	useStore,
	entityName,
	searchableProps,
	orderableProps,
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
						<select
							id="filter"
							name="filterProperty"
							value={store.filterProperty}
							onChange={(event) => store.setFilterProperty(event.currentTarget.value)}
						>
							{searchableProps.map((prop) => {
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
						</select>
					</div>
				</div>
			</CardGroup>
			<CardGroup header="Order the results">
				<div className={styles.search}>
					<div className={styles.order}>
						<p>{t('By')}</p>
						<select
							id="sorter"
							name="UserSorter"
							value={store.sortingProperty}
							onChange={(event) =>
								store.setSortingProperty(event.currentTarget.value)
							}
						>
							{orderableProps.map((prop) => (
								<option key={prop} value={prop}>
									{t(`glossary:${entityName}.${prop}`)}
								</option>
							))}
						</select>
						<p>{t('in order')}</p>
						<select
							id="sorter"
							name="UserSortingOrder"
							value={store.sortingOrder}
							onChange={(event) =>
								store.setSortingOrder(event.currentTarget.value as 'ASC' | 'DESC')
							}
						>
							<option value="ASC">{t('glossary:ascending')}</option>
							<option value="DESC">{t('glossary:descending')}</option>
						</select>
					</div>
				</div>
			</CardGroup>
			{Extra && <Extra />}
		</>
	);
};

export default observer(FilterAndOrderSearchTools);
