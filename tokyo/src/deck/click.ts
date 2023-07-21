import type { Deck, Layer, PickingInfo } from '@deck.gl/core/typed';
import { DeckActionParams, EditMode, TokyoPick } from '../types';
import type { PickableType } from '@tokyo/util';
import { createEventDispatcher } from 'svelte';

interface OnClickBuilder {
	deck: Deck;
	params: DeckActionParams;
	onClick: Layer['onClick'];
}

function withPickHandling(builder: OnClickBuilder): OnClickBuilder {
	return {
		...builder,
		onClick: (info, event) => {
			if (builder.params.mapParams.isPickEnabled) {
				const { x, y } = event.offsetCenter as {
					x: number;
					y: number;
				};
				const pickEvent = builder.deck.pickMultipleObjects({ x, y, radius: 10 });
				const pickings: TokyoPick[] = pickEvent.flatMap((pick: PickingInfo) => {
					if (pick.layer) {
						const split = pick.layer.id.split('|');
						const volume = pick.index;
						return {
							type: split[0] as PickableType,
							id: split[1],
							name: split[2],
							volume,
							layerId: pick.layer.id
						};
					} else {
						return [];
					}
				});
				builder.params.handlers.pick(pickings); // Picking has processed
				// TODO: Avoid processing if nobody is listening
			}
			return builder.onClick(info, event);
		}
	};
}

function withEditModeHandling(builder: OnClickBuilder): OnClickBuilder {
	switch (builder.params.editParams.mode) {
		case EditMode.DISABLED:
		case EditMode.SINGLE:
			return builder;
		case EditMode.MULTI:
			return {
				...builder,
				onClick: (info, event) => {
					builder.params.editParams.handlers.select(null); // Unselect all if I'm editing a multiple volumen polygon
					return builder.onClick(info, event);
				}
			};
	}
}

function build(builder: OnClickBuilder): Layer['onClick'] {
	return builder.onClick;
}

export function getOnClickHandler(params: OnClickBuilder) {
	return build(withPickHandling(withEditModeHandling(params)));
}
