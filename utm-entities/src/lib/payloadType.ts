export class PayloadType {
	id: number;
	name: string;
	camera_sensor?: string;
	camera_focal_distance?: number;

	constructor(id: number, name: string, camera_sensor?: string, camera_focal_distance?: number) {
		this.id = id;
		this.name = name;
		this.camera_sensor = camera_sensor;
		this.camera_focal_distance = camera_focal_distance;
	}
}

export const payloadTypes = [
	{
		id: 1,
		name: 'Default'
	}
];
