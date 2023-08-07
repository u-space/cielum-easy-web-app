import { Static, Type } from '@sinclair/typebox';
import { GeojsonPolygon } from '@utm-entities/v2/model/geojson';
import { UtmEntity } from '@utm-entities/v2/utm-entity';
import { Polygon } from 'geojson';

export const RequestOperationVolume = Type.Object({
	id: Type.Optional(Type.Number()),
	max_altitude: Type.String(), // TODO: Backend should return this as a number
	min_altitude: Type.String(), // TODO: Backend should return this as a number
	beyond_visual_line_of_sight: Type.Boolean(),
	near_structure: Type.Boolean(),
	effective_time_begin: Type.String(),
	effective_time_end: Type.String(),
	ordinal: Type.String(), // TODO: Backend should return this as a number
	operation_geography: GeojsonPolygon
});

export type RequestOperationVolume = Static<typeof RequestOperationVolume>;

export const ResponseOperationVolume = Type.Composite([
	RequestOperationVolume,
	Type.Object({
		id: Type.Number()
	})
]);

export type ResponseOperationVolume = Static<typeof ResponseOperationVolume>;

export class OperationVolume implements UtmEntity<RequestOperationVolume> {
	id: number | null; // Null if not yet saved
	ordinal: number;
	near_structure: boolean;
	effective_time_begin: Date | null;
	effective_time_end: Date | null;
	min_altitude: number;
	max_altitude: number;
	beyond_visual_line_of_sight: boolean;
	operation_geography: Polygon | null;

	[key: string]: OperationVolume[keyof OperationVolume];

	constructor(backendOperationVolume?: ResponseOperationVolume) {
		if (backendOperationVolume) {
			this.id = backendOperationVolume.id;
			this.ordinal = Number(backendOperationVolume.ordinal);
			this.near_structure = backendOperationVolume.near_structure;
			this.effective_time_begin = new Date(backendOperationVolume.effective_time_begin);
			this.effective_time_end = new Date(backendOperationVolume.effective_time_end);
			this.min_altitude = Number(backendOperationVolume.min_altitude);
			this.max_altitude = Number(backendOperationVolume.max_altitude);
			this.beyond_visual_line_of_sight = backendOperationVolume.beyond_visual_line_of_sight;
			this.operation_geography = backendOperationVolume.operation_geography;
		} else {
			this.id = null;
			this.ordinal = 0;
			this.near_structure = false;
			this.effective_time_begin = null;
			this.effective_time_end = null;
			this.min_altitude = 0;
			this.max_altitude = 0;
			this.beyond_visual_line_of_sight = false;
			this.operation_geography = null;
		}
	}

	asBackendFormat(): RequestOperationVolume {
		if (!this.operation_geography) throw new Error('Operation volume must have a polygon');
		if (!this.effective_time_begin) throw new Error('Operation volume must have a start time');
		if (!this.effective_time_end) throw new Error('Operation volume must have an end time');

		const requestOperationVolume: RequestOperationVolume = {
			min_altitude: this.min_altitude.toString(),
			max_altitude: this.max_altitude.toString(),
			beyond_visual_line_of_sight: this.beyond_visual_line_of_sight,
			near_structure: this.near_structure,
			operation_geography: this.operation_geography,
			ordinal: this.ordinal.toString(),
			effective_time_begin: this.effective_time_begin.toISOString(),
			effective_time_end: this.effective_time_end.toISOString()
			// First and last point same-ness is enforced by the map library
		};

		if (this.id) requestOperationVolume.id = this.id; // Operation volume exists, we are updating it
		return requestOperationVolume;
	}

	get displayName() {
		return `${
			this.ordinal
		} (${this.effective_time_begin?.toLocaleTimeString()} - ${this.effective_time_end?.toLocaleTimeString()})`;
	}
}
