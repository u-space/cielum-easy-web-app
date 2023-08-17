import { Type } from '@sinclair/typebox';

export const GeojsonPoint = Type.Object({
	type: Type.Literal('Point'),
	coordinates: Type.Tuple([Type.Number(), Type.Number()])
});

export const GeojsonPolygon = Type.Object({
	type: Type.Literal('Polygon'),
	coordinates: Type.Array(Type.Array(Type.Array(Type.Number())))
});
