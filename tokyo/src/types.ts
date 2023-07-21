import type { Layer } from '@deck.gl/core/typed';
import type { Geometry, Polygon } from 'geojson';
import type { PickableType } from '@tokyo/util';

export type RGB = [RGBnumber, RGBnumber, RGBnumber];
export type RGBA = [RGBnumber, RGBnumber, RGBnumber, RGBnumber];

// For editing the map position externally
export interface FlyToPosition {
	latitude: number;
	longitude: number;
	zoom: number;
	duration?: number; // in milliseconds
}

// For showing either streets or satellite view
export enum BackgroundMode {
	Streets = 'streets',
	Satellite = 'satellite'
}

export interface TokyoMapElement {
	readonly render: Layer[];
}

export interface TokyoPolygonElement extends TokyoMapElement {
	shape: Geometry | Geometry[];
	fill: RGBA;
	getLineColor: (index?: number) => RGBA;
}

export interface TokyoMarkerElement extends TokyoMapElement {
	shape: Geometry | Geometry[];
}

export interface TokyoPickableElement {
	id: string;
}

export interface TokyoPick {
	type: PickableType;
	id?: string;
	name?: string;
	volume?: number;
	layerId?: string;
}

export interface TokyoMapProps {
	elements?: TokyoMapElement[];
	editing?: boolean;
	onEdit?: (polygons: Polygon[]) => void;
	onPick?: (elements: TokyoPick[]) => void;
	onEditingPolygonSelect?: (selected: number) => void;
	editingSingleVolume?: boolean;
}

/* Tokyo internals */
export type UpdateHandler = (layer: Layer) => void;
export type DestroyHandler = (id: string) => void;

/* Convert domain specific entity to a deck.gl layer */
export interface ConvertToLayer<Type, Options = undefined> {
	getId(input: Type): string;
	getConverter(input: Type, options?: Options): () => Layer;
}

export enum EditMode {
	DISABLED = 'disabled',
	SINGLE = 'single',
	MULTI = 'multi'
}

/* Editing props for Tokyo */

export interface EditOptions {
	mode: EditMode;
	polygons?: Polygon[];
}

export interface MapOptions {
	isPickEnabled: boolean;
}

export interface ControlsOptions {
	geocoder: {
		enabled: boolean;
		geoapifyApiKey?: string; // Not supplying it disables Geocoder
	};
	geolocator: {
		enabled: boolean;
	};
	backgroundModeSwitch: {
		enabled: boolean;
	};
}

export interface TokyoProps {
	editOptions: EditOptions;
	mapOptions: MapOptions;
	controlsOptions: ControlsOptions;
	t: (key: string) => string;
}

export type PickHandler = (pickings: TokyoPick[]) => void;
export type SelectHandler = (selected: number | null) => void;
export interface TokyoDispatchedEvent {
	pick: TokyoPick[];
	edit: Polygon[];
	select: number | null;
}

/* Editing parameters for deck object */
export interface EditHandlers {
	edit: (polygons: Polygon[]) => void;
	select: SelectHandler; // Called when a polygon out of a multiple polygon is selected
}

export interface EditParams extends EditOptions {
	handlers: EditHandlers;
	indexSelected: number | null;
}

export interface MapParams {
	backgroundMode: BackgroundMode;
	isPickEnabled: boolean;
}

export interface DeckActionParams {
	position: FlyToPosition;
	layers: Layer[];
	editParams: EditParams;
	handlers: {
		pick: PickHandler;
	};
	mapParams: MapParams;
}

export type RGBnumber =
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11
	| 12
	| 13
	| 14
	| 15
	| 16
	| 17
	| 18
	| 19
	| 20
	| 21
	| 22
	| 23
	| 24
	| 25
	| 26
	| 27
	| 28
	| 29
	| 30
	| 31
	| 32
	| 33
	| 34
	| 35
	| 36
	| 37
	| 38
	| 39
	| 40
	| 41
	| 42
	| 43
	| 44
	| 45
	| 46
	| 47
	| 48
	| 49
	| 50
	| 51
	| 52
	| 53
	| 54
	| 55
	| 56
	| 57
	| 58
	| 59
	| 60
	| 61
	| 62
	| 63
	| 64
	| 65
	| 66
	| 67
	| 68
	| 69
	| 70
	| 71
	| 72
	| 73
	| 74
	| 75
	| 76
	| 77
	| 78
	| 79
	| 80
	| 81
	| 82
	| 83
	| 84
	| 85
	| 86
	| 87
	| 88
	| 89
	| 90
	| 91
	| 92
	| 93
	| 94
	| 95
	| 96
	| 97
	| 98
	| 99
	| 100
	| 101
	| 102
	| 103
	| 104
	| 105
	| 106
	| 107
	| 108
	| 109
	| 110
	| 111
	| 112
	| 113
	| 114
	| 115
	| 116
	| 117
	| 118
	| 119
	| 120
	| 121
	| 122
	| 123
	| 124
	| 125
	| 126
	| 127
	| 128
	| 129
	| 130
	| 131
	| 132
	| 133
	| 134
	| 135
	| 136
	| 137
	| 138
	| 139
	| 140
	| 141
	| 142
	| 143
	| 144
	| 145
	| 146
	| 147
	| 148
	| 149
	| 150
	| 151
	| 152
	| 153
	| 154
	| 155
	| 156
	| 157
	| 158
	| 159
	| 160
	| 161
	| 162
	| 163
	| 164
	| 165
	| 166
	| 167
	| 168
	| 169
	| 170
	| 171
	| 172
	| 173
	| 174
	| 175
	| 176
	| 177
	| 178
	| 179
	| 180
	| 181
	| 182
	| 183
	| 184
	| 185
	| 186
	| 187
	| 188
	| 189
	| 190
	| 191
	| 192
	| 193
	| 194
	| 195
	| 196
	| 197
	| 198
	| 199
	| 200
	| 201
	| 202
	| 203
	| 204
	| 205
	| 206
	| 207
	| 208
	| 209
	| 210
	| 211
	| 212
	| 213
	| 214
	| 215
	| 216
	| 217
	| 218
	| 219
	| 220
	| 221
	| 222
	| 223
	| 224
	| 225
	| 226
	| 227
	| 228
	| 229
	| 230
	| 231
	| 232
	| 233
	| 234
	| 235
	| 236
	| 237
	| 238
	| 239
	| 240
	| 241
	| 242
	| 243
	| 244
	| 245
	| 246
	| 247
	| 248
	| 249
	| 250
	| 251
	| 252
	| 253
	| 254
	| 255;
