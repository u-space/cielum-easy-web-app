import { Polygon } from 'geojson';

export const convertMultipleGeoJsonPolygonsIntoAGeoJsonMultiPolygon = (polygons: Polygon[]) => {
	return {
		type: 'MultiPolygon' as const,
		coordinates: polygons.map((polygon: Polygon) => polygon.coordinates)
	};
};
