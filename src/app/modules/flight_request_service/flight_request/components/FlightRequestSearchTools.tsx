import React, { FC } from 'react';
import { useFlightRequestStore } from '../store';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import GridCheckboxes from '../../../../commons/layouts/dashboard/menu/GridCheckboxes';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import PDateInput from '@pcomponents/PDateInput';
import { useTranslation } from 'react-i18next';
import PButton from '@pcomponents/PButton';
import { FlightRequestState } from '@flight-request-entities/flightRequest';

function dateToYYYYMMDD(date: Date) {
	return [
		date.getFullYear(),
		('0' + (date.getMonth() + 1)).slice(-2),
		('0' + date.getDate()).slice(-2)
	].join('-');
}

const FlightRequestSearchTools: FC = () => {
	const { t } = useTranslation(['ui', 'glossary']);
	const store = useFlightRequestStore((state) => ({
		// filterShowPaid: state.filterShowPaid,
		// setFilterShowPaid: state.setFilterShowPaid,
		// filterShowNotPaid: state.filterShowNotPaid,
		// setFilterShowNotPaid: state.setFilterShowNotPaid,
		filterProperty: state.filterProperty,
		filterMatchingText: state.filterMatchingText,
		setFilterProperty: state.setFilterProperty,
		setFilterByText: state.setFilterByText,
		filterState: state.filterState,
		setFilterState: state.setFilterState
	}));
	const gridItems = [
		// {
		// 	checked: store.filterShowPaid,
		// 	onChange: (check: boolean) => store.setFilterShowPaid(check),
		// 	label: 'Show paid flight requests'
		// },
		// {
		// 	checked: store.filterShowNotPaid,
		// 	onChange: (check: boolean) => store.setFilterShowNotPaid(check),
		// 	label: 'Show pending payment flight requests'
		// },
		{
			checked: store.filterState === FlightRequestState.PENDING,
			onChange: (check: boolean) =>
				store.setFilterState(check ? FlightRequestState.PENDING : undefined),
			label: 'Show pending flight requests'
		}
	];

	return (
		<>
			<FilterAndOrderSearchTools
				useStore={useFlightRequestStore}
				entityName={'flight-request'}
				searchableProps={['id', 'name', 'starting_time', 'createdAt']}
				orderableProps={['createdAt', 'name', 'starting_time']}
			/>
			<CardGroup header="Filter by date">
				{store.filterProperty === 'starting_time' && (
					<PDateInput
						id="starting_time"
						label={t('glossary:flightRequest.starting_time')}
						defaultValue={new Date(store.filterMatchingText || new Date().getTime())}
						onChange={(date) => store.setFilterByText(dateToYYYYMMDD(date))}
					/>
				)}
				{store.filterProperty !== 'starting_time' && (
					<PButton
						onClick={() => {
							store.setFilterProperty('starting_time');
							store.setFilterByText(dateToYYYYMMDD(new Date()));
						}}
					>
						{t('Filter by starting time')}
					</PButton>
				)}
				{store.filterProperty === 'createdAt' && (
					<PDateInput
						id="createdAt"
						label={t('glossary:flightRequest.createdAt')}
						defaultValue={new Date(store.filterMatchingText || new Date().getTime())}
						onChange={(date) => store.setFilterByText(dateToYYYYMMDD(date))}
					/>
				)}
				{store.filterProperty !== 'createdAt' && (
					<PButton
						onClick={() => {
							store.setFilterProperty('createdAt');
							store.setFilterByText(dateToYYYYMMDD(new Date()));
						}}
					>
						{t('Filter by creation date')}
					</PButton>
				)}
			</CardGroup>

			<CardGroup header="Filter by state">
				<GridCheckboxes gridItems={gridItems} />
			</CardGroup>
		</>
	);
};

export default FlightRequestSearchTools;
