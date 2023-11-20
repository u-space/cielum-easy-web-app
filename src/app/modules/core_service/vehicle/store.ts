import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type VehicleStoreSpecificState = Record<never, never>;
export type VehicleStoreState = VehicleStoreSpecificState & FilterableAndPaginableSliceState;

export const useVehicleStore = create<VehicleStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<VehicleStoreSpecificState>(set, get),
			sortingProperty: 'date',
			sortingOrder: 'DESC',
			filterProperty: 'vehicleName'
		}),
		{ name: 'VehicleStore' }
	)
);
