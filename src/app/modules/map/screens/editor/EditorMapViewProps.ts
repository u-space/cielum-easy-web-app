import { GeographicalZone } from '@flight-request-entities/geographicalZone';
import { Polygon } from 'geojson';
import { TokyoPick } from '@tokyo/TokyoTypes';

export type EditorMapViewProps = SingleVolumeEditorMapViewProps | MultiVolumeEditorMapViewProps;

export interface SingleVolumeEditorMapViewProps {
	geographicalZones: GeographicalZone[];
	handlers: {
		edit: (polygons: Polygon[]) => void;
		pick: (elements: TokyoPick[]) => void;
	};
	editingSingleVolume: true;
	defaultPolygons: Polygon[];
}

export interface MultiVolumeEditorMapViewProps {
	geographicalZones: GeographicalZone[];
	handlers: {
		edit: (polygons: Polygon[]) => void;
		pick: (elements: TokyoPick[]) => void;
		editingPolygonSelect: (selected: number) => void;
	};
	editingSingleVolume: false;
	defaultPolygons: Polygon[];
}
