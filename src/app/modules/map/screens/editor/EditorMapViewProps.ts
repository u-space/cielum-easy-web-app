import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { Polygon } from 'geojson';
import { EditOptions, TokyoPick } from '@tokyo/types';

export interface EditorMapViewProps {
	geographicalZones: GeographicalZone[];
	editOptions: EditOptions;
}
