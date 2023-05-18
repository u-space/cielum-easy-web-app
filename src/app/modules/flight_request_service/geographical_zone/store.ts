import { create } from 'zustand';
import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { devtools } from 'zustand/middleware';

export interface GeographicalZoneStoreSpecificState {
	hiddenGeographicalZones: string[];
	setHiddenGeographicalZones: (value: string[]) => void;
}

export type GeographicalZoneStoreState = GeographicalZoneStoreSpecificState &
	FilterableAndPaginableSliceState;

export const useGeographicalZoneStore = create<GeographicalZoneStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<GeographicalZoneStoreSpecificState>(set, get),
			hiddenGeographicalZones: [],
			setHiddenGeographicalZones: (value) => set({ hiddenGeographicalZones: value })
		}),
		{ name: 'GeographicalZoneStore' }
	)
);
