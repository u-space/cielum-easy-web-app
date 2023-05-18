import { RGBA, TokyoMapElement } from '../../TokyoTypes';
import { Point } from 'geojson';
import { LineLayer } from '@deck.gl/layers/typed';

export class TokyoLines implements TokyoMapElement {
	readonly positions: { from: Point; to: Point }[];
	readonly colorStart: RGBA;
	readonly colorEnd: RGBA;

	constructor(
		positions: { from: Point; to: Point; colorMultiplier?: number }[],
		colorStart: RGBA = [255, 0, 0, 255],
		colorEnd: RGBA = [0, 255, 0, 255]
	) {
		this.positions = positions;
		this.colorStart = colorStart;
		this.colorEnd = colorEnd;
	}

	get render(): LineLayer[] {
		return [
			new LineLayer({
				id: 'line-layer',
				data: this.positions,
				pickable: false,
				getWidth: 5,
				getSourcePosition: (d) => d.from.coordinates,
				getTargetPosition: (d) => d.to.coordinates,
				getColor: (d) => {
					// Interpolate between the two colors
					const from = this.colorStart;
					const to = this.colorEnd;
					const t = d.colorMultiplier ?? 0.5;
					const r = from[0] * (1 - t) + to[0] * t;
					const g = from[1] * (1 - t) + to[1] * t;
					const b = from[2] * (1 - t) + to[2] * t;
					return [r, g, b, this.colorEnd[3]];
				}
			})
		];
	}
}
