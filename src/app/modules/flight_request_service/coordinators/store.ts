import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type CoordinatorStoreSpecificState = Record<never, never>; // Empty
export type CoordinatorStoreState = FilterableAndPaginableSliceState;

export const useCoordinatorStore = create<CoordinatorStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<CoordinatorStoreSpecificState>(set, get),
			sortingProperty: 'email',
			filterProperty: 'telephone'
		}),
		{ name: 'CoordinatorsStore' }
	)
);
