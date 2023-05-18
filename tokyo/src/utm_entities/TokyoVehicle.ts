import { TokyoIcon } from '../shapes/2d/TokyoIcon';
import { Position } from '@dronfies/microutm-entities/position';
import tokyoVehicleMarker from '../img/TokyoVehicleMarker.png';
import {
	ACTIVE_DRONE_LINE_COLOR,
	ACTIVE_DRONE_MARKER_COLOR,
	INACTIVE_DRONE_MARKER_COLOR
} from '../TokyoDefaults';
import { TokyoMapElement } from '../TokyoTypes';
import { Layer } from '@deck.gl/core/typed';
import { TokyoLines } from '../shapes/2d/TokyoLines';
import _ from 'lodash';

export class TokyoVehicle implements TokyoMapElement {
	readonly positions: Position[];
	readonly onClick: () => void;

	constructor(positions: Position[], onClick: () => void) {
		this.positions = positions;
		this.onClick = onClick;
	}

	get render(): any {
		const newestPosition = this.positions[this.positions.length - 1];
		const icon = new TokyoIcon(
			`DRONE|${newestPosition.gufi}`,
			newestPosition.location,
			tokyoVehicleMarker,
			{
				x: 0,
				y: 0,
				width: 96,
				height: 96,
				mask: true
			},
			-newestPosition.heading,
			ACTIVE_DRONE_MARKER_COLOR,
			this.onClick
		);
		if (this.positions.length > 1) {
			const colorMultiplier = 1 / this.positions.length;
			const line = _.reduce(
				this.positions.slice(1),
				(acc, pos) => [
					...acc,
					{
						from: acc[acc.length - 1].to,
						to: pos.location,
						colorMultiplier: acc[acc.length - 1].colorMultiplier + colorMultiplier
					}
				],
				[
					{
						from: this.positions[0].location,
						to: this.positions[1].location,
						colorMultiplier: 0
					}
				]
			);
			const lines = new TokyoLines(
				line,
				INACTIVE_DRONE_MARKER_COLOR,
				ACTIVE_DRONE_LINE_COLOR
			);
			return [lines.render, icon.render];
		} else {
			// TODO: Add computed position of following point
			return [icon.render];
		}
	}
}
