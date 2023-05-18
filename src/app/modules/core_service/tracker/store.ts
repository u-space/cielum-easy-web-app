import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type TrackerStoreSpecificState = Record<never, never>;
export type TrackerStoreState = TrackerStoreSpecificState & FilterableAndPaginableSliceState;

export const useTrackerStore = create<TrackerStoreState>()(
	devtools((set, get) => ({
		...createFilterableAndPaginableSlice(set, get),
		filterProperty: 'hardware_id'
	}))
);
