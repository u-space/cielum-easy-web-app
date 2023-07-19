// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { PickingInfo } from '@deck.gl/core/typed/lib/picking/pick-info';
import { TokyoInternalState } from '../Tokyo.svelte';
import { MapEditMode } from '../types';

export function setMapOnClick(state: TokyoInternalState) {
	if (!state.deck) return;
	const onClick = (info: any, evt: any) => {
		switch (state.edit.mode) {
			case MapEditMode.EDITING:
				if (!state.edit.single) {
					state.edit.onSelect(null); // Unselect all if I'm editing unless I'm in single volume editor mode
				}
				return;
			case MapEditMode.PAUSED:
				state.edit.onSelect(null);
				break;
			case MapEditMode.INACTIVE:
				break;
		}

		const { x, y } = evt.offsetCenter as { x: number; y: number };
		if (state.onPick) {
			const pickEvent = state.deck.pickMultipleObjects({ x, y });
			const pickings = pickEvent.map((pick: PickingInfo) => {
				if (pick.layer) {
					const split = pick.layer.id.split('|');
					const volumeSplit = pick.layer.id.split('<');
					return {
						type: split[0],
						id: split[1],
						name: volumeSplit.length > 1 ? split[2].slice(0, -3) : split[2],
						volume: volumeSplit.length > 1 ? Number(volumeSplit[1][0]) : undefined
					};
				}
				return { type: 'UNKNOWN', id: undefined, name: undefined };
			});
			state.onPick(pickings); // Picking has processed
		}
		return false;
	};
	state.deck.setProps({ onClick });
}
