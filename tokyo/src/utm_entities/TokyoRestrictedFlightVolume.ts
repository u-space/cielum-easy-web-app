import { TokyoPolygon } from '../shapes/2d/TokyoPolygon';
import { RFV_FILL_COLOR, RFV_LINE_COLOR } from '../TokyoDefaults';
import type { RfvEntity } from '@utm-entities/rfv';

/*const fillImage: FillImage; = {
 atlas: TokyoRestrictedFlightVolumeFill,
 mapping: {
   pattern: {
     x: 0,
     y: 0,
     width: 64,
     height: 64
   }
 },
 patternMask: false,
 patternScale: 0.5
};*/

export class TokyoRestrictedFlightVolume extends TokyoPolygon {
	constructor(rfv: RfvEntity) {
		super({
			polygon: rfv.geography,
			id: `rfv|${rfv.id}|${rfv.comments}`,
			fill: RFV_FILL_COLOR,
			getLineColor: () => RFV_LINE_COLOR,
			dashArray: [8, 4]
		});
	}
}
