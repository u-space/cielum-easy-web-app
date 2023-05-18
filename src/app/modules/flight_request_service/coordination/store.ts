import { CoordinationState } from '@flight-request-entities/coordination';
import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import env from '../../../../vendor/environment/env';

const CoordinatorType = env.tenant.features.FlightRequests.enabled
	? env.tenant.features.FlightRequests.options.coordinatorTypes
	: [];

export interface CoordinationStoreSpecificState {
	filterShowStates: Map<CoordinationState, boolean>;
	filterCoordinatorTypes: Map<string, boolean>;
	setFilterState: (state: CoordinationState, value: boolean) => void;
	setFilterCoordinatorType: (type: string, value: boolean) => void;
}

export type CoordinationStoreState = CoordinationStoreSpecificState &
	FilterableAndPaginableSliceState;

const filterCoordinatorTypes = new Map<string, boolean>();
for (const type of CoordinatorType) {
	filterCoordinatorTypes.set(type, true);
}

export const useCoordinationStore = create<CoordinationStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<CoordinationStoreSpecificState>(set, get),
			sortingProperty: 'limit_date',
			filterProperty: 'reference',
			filterShowStates: new Map<CoordinationState, boolean>([
				[CoordinationState.APPROVED, true],
				[CoordinationState.APPROVED, true],
				[CoordinationState.IN_NEED_OF_MODIFICATION, true],
				[CoordinationState.REJECTED, true],
				[CoordinationState.REQUESTED, true],
				[CoordinationState.SELF_MANAGED, true],
				[CoordinationState.TO_DO, true]
			]),
			filterCoordinatorTypes: filterCoordinatorTypes,
			setFilterState: (state: CoordinationState, value: boolean) => {
				const filterShowStates = get().filterShowStates;
				filterShowStates.set(state, value);
				set({ filterShowStates });
			},
			setFilterCoordinatorType: (type: string, value: boolean) => {
				const filterCoordinatorTypes = get().filterCoordinatorTypes;
				filterCoordinatorTypes.set(type, value);
				set({ filterCoordinatorTypes });
			}
		}),
		{ name: 'CoordinationStore' }
	)
);
