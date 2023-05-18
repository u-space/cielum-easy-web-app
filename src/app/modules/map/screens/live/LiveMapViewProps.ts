import { OperationEntity } from '@utm-entities/operation';
import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { RfvEntity } from '@utm-entities/rfv';
import { UvrEntity } from '@utm-entities/uvr';
import { PositionEntity } from '@utm-entities/position';
import { TokyoPick } from '@tokyo/TokyoTypes';

export interface LiveMapViewProps {
	operations: OperationEntity[];
	geographicalZones: GeographicalZone[];
	rfvs: RfvEntity[];
	uvrs: UvrEntity[];
	vehicles: PositionEntity[][];
	selected: {
		gufi: string | null;
		volume: string | null;
		geographicalZone: string | null;
	};
	handlers: {
		vehicleClick?: (vehicle: PositionEntity[]) => void;
		pick?: (elements: TokyoPick[]) => void;
	};
}
