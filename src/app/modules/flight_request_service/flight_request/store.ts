import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type FlightRequestStoreSpecificState = Record<never, never>;
export type FlightRequestStoreState = FilterableAndPaginableSliceState;

export const useFlightRequestStore = create<FlightRequestStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<FlightRequestStoreSpecificState>(set, get),
			sortingProperty: 'id',
			filterProperty: 'id'
		}),
		{ name: 'FlightRequestStore' }
	)
);
