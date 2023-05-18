import {
	createFilterableAndPaginableSlice,
	FilterableAndPaginableSliceState
} from '../../../commons/stores/FilterableAndPaginableSlice';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export enum UserVerificationState {
	CONFIRMED = 'confirmed',
	UNCONFIRMED = 'unconfirmed',
	ALL = 'all'
}
export interface UserStoreSpecificState {
	filterStatus: UserVerificationState;
	setFilterStatus: (value: UserVerificationState) => void;
}
export type UserStoreState = UserStoreSpecificState & FilterableAndPaginableSliceState;

export const useUserStore = create<UserStoreState>()(
	devtools(
		(set, get) => ({
			...createFilterableAndPaginableSlice(set, get),
			sortingProperty: 'email',
			filterProperty: 'email',
			filterStatus: UserVerificationState.ALL,
			setFilterStatus: (value) => set({ filterStatus: value })
		}),
		{ name: 'UserStore' }
	)
);
