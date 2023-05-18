import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface RfvStoreSpecificState {
	hiddenRfvs: string[];
}

export type RfvStoreState = RfvStoreSpecificState & FilterableAndPaginableSliceState;

export const useRfvStore = create<RfvStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<RfvStoreSpecificState>(set, get),
			hiddenRfvs: [],
			sortingProperty: 'comments'
		}),
		{ name: 'RfvStore' }
	)
);
