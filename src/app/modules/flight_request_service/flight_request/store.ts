import { FlightRequestState } from '@flight-request-entities/flightRequest';
import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface FlightRequestStoreSpecificState {
	filterShowPaid: boolean;
	filterShowNotPaid: boolean;
	filterState: FlightRequestState | undefined;
	setFilterShowPaid: (filterShowPaid: boolean) => void;
	setFilterShowNotPaid: (filterShowNotPaid: boolean) => void;
	setFilterState: (filterState: FlightRequestState | undefined) => void;
}

export type FlightRequestStoreState = FilterableAndPaginableSliceState &
	FlightRequestStoreSpecificState;

export const useFlightRequestStore = create<FlightRequestStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<FlightRequestStoreSpecificState>(set, get),
			sortingProperty: 'createdAt',
			sortingOrder: 'DESC',
			filterProperty: 'id',
			filterShowNotPaid: false,
			filterShowPaid: true,
			filterState: FlightRequestState.PENDING,
			setFilterShowNotPaid: (filterShowNotPaid: boolean) => set({ filterShowNotPaid }),
			setFilterShowPaid: (filterShowPaid: boolean) => set({ filterShowPaid }),
			setFilterState: (filterState: FlightRequestState | undefined) =>
				set({ filterState: filterState })
		}),
		{ name: 'FlightRequestStore' }
	)
);
