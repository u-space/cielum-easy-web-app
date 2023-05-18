import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const DATE_FROM = new Date();
//DATE_FROM.setFullYear(DATE_FROM.getFullYear() - 1);
const DATE_TO = new Date();
//DATE_TO.setHours(24, 0);
DATE_TO.setMonth(DATE_FROM.getMonth() + 1);
export interface OperationStoreSpecificState {
	filterShowProposed: boolean;
	filterShowAccepted: boolean;
	filterShowNotAccepted: boolean;
	filterShowPending: boolean;
	filterShowActivated: boolean;
	filterShowRogue: boolean;
	filterShowClosed: boolean;
	hiddenOperations: string[];

	setFilterProposed: (value: boolean) => void;
	setFilterAccepted: (value: boolean) => void;
	setFilterNotAccepted: (value: boolean) => void;
	setFilterPending: (value: boolean) => void;
	setFilterActivated: (value: boolean) => void;
	setFilterRogue: (value: boolean) => void;
	setFilterClosed: (value: boolean) => void;
	setHiddenOperations: (value: string[]) => void;

	getStates: () => string[]; // List of currently selected states (filterShow{State} = true),
	toggleHiddenOperation: (id: string) => void;

	// Historical mode
	isFilteringByDates: boolean;
	setFilteringByDates: (value: boolean) => void;
	historicalFromDate: Date | null; // null only if isFilteringByDates = false
	historicalToDate: Date | null; // null only if isFilteringByDates = false
	setHistoricalDates: (from: Date | null, to: Date | null) => void;
}

export type OperationStoreState = OperationStoreSpecificState & FilterableAndPaginableSliceState;

export const useOperationStore = create<OperationStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice<OperationStoreSpecificState>(set, get),
			filterShowProposed: true,
			filterShowAccepted: true,
			filterShowNotAccepted: false,
			filterShowPending: true,
			filterShowActivated: true,
			filterShowRogue: true,
			filterShowClosed: false,
			hiddenOperations: [],

			setFilterProposed: (value) => set({ filterShowProposed: value }),
			setFilterAccepted: (value) => set({ filterShowAccepted: value }),
			setFilterNotAccepted: (value) => set({ filterShowNotAccepted: value }),
			setFilterPending: (value) => set({ filterShowPending: value }),
			setFilterActivated: (value) => set({ filterShowActivated: value }),
			setFilterRogue: (value) => set({ filterShowRogue: value }),
			setFilterClosed: (value) => set({ filterShowClosed: value }),
			setHiddenOperations: (value) => set({ hiddenOperations: value }),

			getStates: () => {
				const states: string[] = [];
				if (get().filterShowProposed) states.push('PROPOSED');
				if (get().filterShowAccepted) states.push('ACCEPTED');
				if (get().filterShowNotAccepted) states.push('NOT_ACCEPTED');
				if (get().filterShowPending) states.push('PENDING');
				if (get().filterShowClosed) states.push('CLOSED');
				if (get().filterShowActivated) states.push('ACTIVATED');
				if (get().filterShowRogue) states.push('ROGUE');
				return states;
			},
			toggleHiddenOperation: (id: string) => {
				const hiddenOperations = get().hiddenOperations;
				const index = hiddenOperations.indexOf(id);
				if (index === -1) {
					hiddenOperations.push(id);
				} else {
					hiddenOperations.splice(index, 1);
				}
				set({ hiddenOperations });
			},
			// Historical mode
			isFilteringByDates: false,
			historicalFromDate: DATE_FROM,
			historicalToDate: DATE_TO,
			setFilteringByDates: (value) => set({ isFilteringByDates: value }),
			setHistoricalDates: (from, to) =>
				set({ historicalFromDate: from, historicalToDate: to })
		}),
		{ name: 'OperationStore' }
	)
);
