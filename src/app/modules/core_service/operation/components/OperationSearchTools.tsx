import React, { FC } from 'react';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import { useOperationStore } from '../store';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import GridCheckboxes from '../../../../commons/layouts/dashboard/menu/GridCheckboxes';
import HistoricalModeCheckboxes from './HistoricalModeCheckboxes';

const OperationSearchToolsExtra = () => {
	const { t } = useTranslation(['ui', 'glossary']);
	const history = useHistory();
	const store = useOperationStore(
		(state) => ({
			filterShowProposed: state.filterShowProposed,
			filterShowAccepted: state.filterShowAccepted,
			filterShowActivated: state.filterShowActivated,
			filterShowPending: state.filterShowPending,
			filterShowRogue: state.filterShowRogue,
			filterShowClosed: state.filterShowClosed,
			filterShowNotAccepted: state.filterShowNotAccepted,
			setFilterProposed: state.setFilterProposed,
			setFilterAccepted: state.setFilterAccepted,
			setFilterActivated: state.setFilterActivated,
			setFilterPending: state.setFilterPending,
			setFilterRogue: state.setFilterRogue,
			setFilterClosed: state.setFilterClosed,
			setFilterNotAccepted: state.setFilterNotAccepted,

			filterMatchingText: state.filterMatchingText,
			filterProperty: state.filterProperty,
			setFilterByText: state.setFilterByText,
			setFilterProperty: state.setFilterProperty,
			sortingProperty: state.sortingProperty,
			setSortingOrder: state.setSortingOrder,
			setSortingProperty: state.setSortingProperty,
			sortingOrder: state.sortingOrder,

			isFilteringByDates: state.isFilteringByDates,
			setFilteringByDates: state.setFilteringByDates,
			historicalFromDate: state.historicalFromDate,
			historicalToDate: state.historicalToDate,
			setHistoricalDates: state.setHistoricalDates
		}),
		shallow
	);

	const gridItems = [
		{
			checked: store.filterShowProposed,
			onChange: (check: boolean) => store.setFilterProposed(check),
			label: 'PROPOSED'
		},
		{
			checked: store.filterShowAccepted,
			onChange: (check: boolean) => store.setFilterAccepted(check),
			label: 'ACCEPTED'
		},
		{
			checked: store.filterShowActivated,
			onChange: (check: boolean) => store.setFilterActivated(check),
			label: 'ACTIVATED'
		},
		{
			checked: store.filterShowPending,
			onChange: (check: boolean) => store.setFilterPending(check),
			label: 'PENDING'
		},
		{
			checked: store.filterShowRogue,
			onChange: (check: boolean) => store.setFilterRogue(check),
			label: 'ROGUE'
		},
		{
			checked: store.filterShowClosed,
			onChange: (check: boolean) => store.setFilterClosed(check),
			label: 'CLOSED'
		},
		{
			checked: store.filterShowNotAccepted,
			onChange: (check: boolean) => store.setFilterNotAccepted(check),
			label: 'NOT_ACCEPTED'
		}
	];

	return (
		<>
			{/*<CardGroup header="Date range">
				<HistoricalModeCheckboxes
					checked={store.isFilteringByDates}
					onCheck={(isChecked) => {
						store.setFilteringByDates(isChecked);
					}}
					from={store.historicalFromDate}
					to={store.historicalToDate}
					onDateChange={(from, to) => store.setHistoricalDates(from, to)}
				/>
			</CardGroup>*/}
			<CardGroup header="Filter by state">
				<GridCheckboxes gridItems={gridItems} />
			</CardGroup>
		</>
	);
};

const OperationSearchTools: FC = () => {
	return (
		<FilterAndOrderSearchTools
			useStore={useOperationStore}
			entityName={'operation'}
			searchableProps={['name']}
			orderableProps={['submit_time']}
			extra={OperationSearchToolsExtra}
		/>
	);
};

export default OperationSearchTools;
