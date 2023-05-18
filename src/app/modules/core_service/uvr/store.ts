import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type UvrStoreSpecificState = Record<never, never>;

export type UvrStoreState = UvrStoreSpecificState & FilterableAndPaginableSliceState;

export const useUvrStore = create<UvrStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<UvrStoreSpecificState>(set, get)
		}),
		{ name: 'UvrStore' }
	)
);
