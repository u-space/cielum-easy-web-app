import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PositionEntity } from '@utm-entities/position';

export interface PositionStoreState {
	positions: Map<string, PositionEntity[]>;
	addPosition: (position: PositionEntity) => void;
}

export const usePositionStore = create<PositionStoreState>()(
	devtools(
		(set, get) => ({
			positions: new Map<string, PositionEntity[]>(),
			addPosition: (position: PositionEntity) => {
				set((state) => {
					const id = position.gufi + position.uvin;
					let positionsOfOneVehicle = state.positions.get(id) || [];
					positionsOfOneVehicle = [...positionsOfOneVehicle, position];
					return { positions: new Map(state.positions).set(id, positionsOfOneVehicle) };
				});
			}
		}),
		{ name: 'PositionStore' }
	)
);
