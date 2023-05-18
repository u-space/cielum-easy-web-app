import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type RegularFlightStoreSpecificState = Record<never, never>;
export type RegularFlightStoreState = RegularFlightStoreSpecificState &
	FilterableAndPaginableSliceState;

export const useRegularFlightStore = create<RegularFlightStoreState>()(
	devtools((set, get) => ({
		...createFilterableAndPaginableSlice(set, get),
		sortingProperty: 'name',
		filterProperty: 'name'
	}))
);
