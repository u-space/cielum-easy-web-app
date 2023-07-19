import { IconLayer } from '@deck.gl/layers/typed';
import { Point } from 'geojson';
import { RGB, TokyoMarkerElement } from '../../types';

export interface IconMapping {
	x: number;
	y: number;
	width: number;
	height: number;
	mask: boolean;
}

export class TokyoIcon implements TokyoMarkerElement {
	constructor(
		id: string,
		shape: Point,
		iconUrl: string,
		mapping: IconMapping,
		rotation = 0,
		color: RGB = [255, 0, 0],
		onClick: () => void
	) {
		this._id = id;
		this.shape = shape;
		this.iconUrl = iconUrl;
		this.mapping = { marker: mapping };
		this.color = color;
		this.rotation = rotation;
		this.onClick = onClick;
	}

	readonly onClick: () => void;
	rotation = 0;
	color: RGB;
	private readonly mapping: {
		[key: string]: IconMapping;
	};
	iconUrl: string;
	shape: Point;
	private readonly _id: string;

	get id(): string {
		return this._id;
	}

	get render(): IconLayer[] {
		return [
			new IconLayer({
				id: this.id,
				data: [this.shape],
				pickable: true,
				// iconAtlas and iconMapping are required
				// getIcon: return a string
				iconAtlas: this.iconUrl,
				getIcon: (d) => 'marker',
				iconMapping: this.mapping,
				sizeScale: 30,
				getPosition: (d) => d.coordinates,
				getAngle: (d) => this.rotation,
				getSize: (d) => 1,
				getColor: (d) => this.color,
				onIconError: (error) => alert(error),
				billboard: false,
				onClick: this.onClick
			})
		];
	}
}
