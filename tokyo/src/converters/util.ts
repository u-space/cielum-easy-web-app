export const ELEVATION_MULTIPLIER = 1;
export function calculateLocationWithElevationMultiplier(coordinates: number[]) {
	return [coordinates[0], coordinates[1], coordinates[2] * ELEVATION_MULTIPLIER];
}
