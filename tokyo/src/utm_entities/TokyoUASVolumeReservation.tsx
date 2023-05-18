import type { UvrEntity } from '@utm-entities/uvr';
import { TokyoPolygon } from '../shapes/2d/TokyoPolygon';
import { UVR_FILL_COLOR, UVR_LINE_COLOR } from '../TokyoDefaults';

export class TokyoUASVolumeReservation extends TokyoPolygon {
	constructor(uvr: UvrEntity) {
		super(
			uvr.geography,
			`uvr|${uvr.message_id}|${uvr.reason}`,
			UVR_FILL_COLOR,
			() => UVR_LINE_COLOR,
			undefined,
			[6, 3]
		);
	}
}
