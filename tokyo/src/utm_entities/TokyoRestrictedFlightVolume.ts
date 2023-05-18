import { GeographicalZone } from '@dronfies/microutm-entities/geographicalZone';
import { FillImage, TokyoPolygon } from '../shapes/2d/TokyoPolygon';
import { RFV_FILL_COLOR, RFV_LINE_COLOR } from '../TokyoDefaults';
import { RfvEntity } from '@dronfies/microutm-entities/rfv';
import TokyoRestrictedFlightVolumeFill from '../img/TokyoRestrictedFlightVolume.png';

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
		super(
			rfv.geography,
			`rfv|${rfv.id}|${rfv.comments}`,
			RFV_FILL_COLOR,
			() => RFV_LINE_COLOR,
			undefined,
			[8, 4]
		);
	}
}
