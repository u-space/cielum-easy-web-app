import { FlightRequestState } from '@flight-request-entities/flightRequest';
import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface FlightRequestStoreSpecificState {
	filterState: string | undefined;
	setFilterState: (filterState: string | undefined) => void;
}

export type FlightRequestStoreState = FilterableAndPaginableSliceState &
	FlightRequestStoreSpecificState;

export const useFlightRequestStore = create<FlightRequestStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<FlightRequestStoreSpecificState>(set, get),
			sortingProperty: 'createdAt',
			sortingOrder: 'DESC',
			filterProperty: 'name',
			filterState: `${FlightRequestState.PENDING},${FlightRequestState.REQUIRE_APPROVAL}`,
			setFilterState: (filterState: string | undefined) =>
				set({ filterState: filterState })
		}),
		{ name: 'FlightRequestStore' }
	)
);
