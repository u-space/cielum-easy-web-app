import type { RGB, RGBA } from './TokyoTypes';

export const DEFAULT_FILL_COLOR = [100, 200, 100, 60];
export const EXISTING_HANDLE_FILL_COLOR = [255, 0, 0, 100];
export const EXISTING_HANDLE_RADIUS = 8;
export const INTERMEDIATE_HANDLE_FILL_COLOR = [0, 0, 0, 255];
export const INTERMEDIATE_HANDLE_RADIUS = 5;
export const HANDLE_OUTLINE_COLOR = [0, 0, 100, 255];
export const DEFAULT_LINE_COLOR = [0, 0, 0, 255];

// Selected editable colors: Polygon currently being edited
export const SELECTED_EDITABLE_FILL_COLOR = [0, 36, 115, 80];
export const SELECTED_EDITABLE_LINE_COLOR = [0, 36, 115, 80];

// Non-Selected editable colors: Polygon that is not currently being edited, but is already existing
export const NON_SELECTED_EDITABLE_FILL_COLOR = [45, 52, 66, 80];
export const NON_SELECTED_EDITABLE_LINE_COLOR = [45, 52, 66, 255];

// Tentative colors: Polygons that are being drawn
export const TENTATIVE_FILL_COLOR = [0, 36, 115, 80];
export const TENTATIVE_LINE_COLOR = [0, 36, 115, 255];

// Selected Operation
export const SELECTED_OPERATION_LINE_COLOR = [105, 17, 17, 255];
export const SELECTED_OPERATION_VOLUME_LINE_COLOR = [219, 35, 35, 255];

// Geographical Zone
export const GZ_FILL_COLOR: RGBA = [216, 32, 32, 50];
export const SELECTED_GZ_FILL_COLOR: RGBA = [216, 32, 32, 100];
export const GZ_LINE_COLOR: RGBA = [130, 43, 43, 255];

// Restricted Flight Volume
export const RFV_FILL_COLOR: RGBA = [249, 0, 0, 100];
export const RFV_LINE_COLOR: RGBA = [249, 0, 0, 255];

// UAS Volume Reservation
export const UVR_FILL_COLOR: RGBA = [244, 102, 0, 100];
export const UVR_LINE_COLOR: RGBA = [244, 102, 0, 255];

// Flight Request
export const FR_SELECTED_FILL_COLOR: RGBA = [100, 150, 100, 150];
export const FR_FILL_COLOR: RGBA = [100, 100, 100, 50];
export const FR_LINE_COLOR: RGBA = [100, 100, 100, 255];

// Drone Marker
export const ACTIVE_DRONE_MARKER_COLOR: RGB = [62, 223, 62];
export const INACTIVE_DRONE_MARKER_COLOR: RGBA = [206, 206, 206, 255];
export const ACTIVE_DRONE_LINE_COLOR: RGBA = [85, 195, 85, 150];

/*
  Operation Coloring
*/
export const OPERATION_STATE_COLORS: Record<string, RGB> = {
	PROPOSED: [0, 23, 50],
	ACCEPTED: [0, 26, 255],
	ACTIVATED: [153, 255, 137],
	PENDING: [255, 243, 0],
	ROGUE: [255, 0, 0],
	CLOSED: [0, 40, 20],
	NOT_ACCEPTED: [50, 0, 0]
};

export const OPERATION_STATE_COLORS_CSS = {
	PROPOSED: `rgb(${OPERATION_STATE_COLORS['PROPOSED'].join(',')})`,
	ACCEPTED: `rgb(${OPERATION_STATE_COLORS['ACCEPTED'].join(',')})`,
	ACTIVATED: `rgb(${OPERATION_STATE_COLORS['ACTIVATED'].join(',')})`,
	PENDING: `rgb(${OPERATION_STATE_COLORS['PENDING'].join(',')})`,
	ROGUE: `rgb(${OPERATION_STATE_COLORS['ROGUE'].join(',')})`,
	CLOSED: `rgb(${OPERATION_STATE_COLORS['CLOSED'].join(',')})`,
	NOT_ACCEPTED: `rgb(${OPERATION_STATE_COLORS['NOT_ACCEPTED'].join(',')})`
};
