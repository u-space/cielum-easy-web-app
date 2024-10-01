import React, { FC, useEffect } from 'react';
import { useFlightRequestStore } from '../store';
import FilterAndOrderSearchTools from '../../../../commons/components/hubs/FilterAndOrderSearchTools';
import GridCheckboxes from '../../../../commons/layouts/dashboard/menu/GridCheckboxes';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import PDateInput from '@pcomponents/PDateInput';
import { useTranslation } from 'react-i18next';
import PButton from '@pcomponents/PButton';
import { FlightRequestState } from '@flight-request-entities/flightRequest';
import { useAuthIsAdmin } from 'src/app/modules/auth/store';

function dateToYYYYMMDD(date: Date) {
	const aux = new Date(date)
	return aux.toISOString().split('T')[0]
}

const FlightRequestSearchTools: FC = () => {
	const { t } = useTranslation(['ui', 'glossary']);
	const isAdmin = useAuthIsAdmin();

	const store = useFlightRequestStore((state) => ({
		filterProperty: state.filterProperty,
		filterMatchingText: state.filterMatchingText,
		setFilterProperty: state.setFilterProperty,
		setFilterByText: state.setFilterByText,
		filterState: state.filterState,
		setFilterState: state.setFilterState
	}));

	useEffect(() => {
		if (!isAdmin) {
			store.setFilterState(undefined);
		} else {
			store.setFilterState(`${FlightRequestState.PENDING},${FlightRequestState.REQUIRE_APPROVAL}`);
		}
	}, []);



	const gridItems = [

		{
			checked: store.filterState == `${FlightRequestState.PENDING},${FlightRequestState.REQUIRE_APPROVAL}`,
			onChange: (check: boolean) =>
				store.setFilterState(check ? `${FlightRequestState.PENDING},${FlightRequestState.REQUIRE_APPROVAL}` : undefined),
			label: t('Pending administrative management'),
		}
	];



	return (
		<>
			<FilterAndOrderSearchTools
				useStore={useFlightRequestStore}
				entityName={'flight-request'}
				searchableProps={['name', 'createdAt']}
				orderableProps={['createdAt', 'name']}
			/>
			<CardGroup header="Filter by date">
				{store.filterProperty === 'createdAt' && (
					<PDateInput
						id="createdAt"
						label={t('glossary:flightRequest.createdAt')}
						defaultValue={new Date(store.filterMatchingText || new Date().getTime())}
						onChange={(date) => {
							store.setFilterByText(dateToYYYYMMDD(date))
						}}
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
