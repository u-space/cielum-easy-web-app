import React, { FC } from 'react';
import { useFlightRequestStore } from '../store';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import GridCheckboxes from '../../../../commons/layouts/dashboard/menu/GridCheckboxes';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';

const FlightRequestSearchTools: FC = () => {
	const store = useFlightRequestStore((state) => ({
		filterShowPaid: state.filterShowPaid,
		setFilterShowPaid: state.setFilterShowPaid,
		filterShowNotPaid: state.filterShowNotPaid,
		setFilterShowNotPaid: state.setFilterShowNotPaid
	}));
	const gridItems = [
		{
			checked: store.filterShowPaid,
			onChange: (check: boolean) => store.setFilterShowPaid(check),
			label: 'Show paid flight requests'
		},
		{
			checked: store.filterShowNotPaid,
			onChange: (check: boolean) => store.setFilterShowNotPaid(check),
			label: 'Show pending payment flight requests'
		}
	];

	return (
		<>
			<FilterAndOrderSearchTools
				useStore={useFlightRequestStore}
				entityName={'flight-request'}
				searchableProps={['id', 'name']}
				orderableProps={['createdAt', 'name']}
			/>
			<CardGroup header="Filter by state">
				<GridCheckboxes gridItems={gridItems} />
			</CardGroup>
		</>
	);
};

export default FlightRequestSearchTools;
