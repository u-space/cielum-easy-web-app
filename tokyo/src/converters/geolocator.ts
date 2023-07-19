import type { ConvertToLayer } from '../types';
import { IconLayer } from '@deck.gl/layers/typed';
import geolocatorIcon from '../img/geolocator.png';

type GeolocatorTokyoConverter = ConvertToLayer<GeolocationPosition, undefined>;

const ICON_MAPPING = {
	geolocator: {
		x: 0,
		y: 0,
		width: 96,
		height: 96,
		mask: false
	}
};

const getConverterFromGeolocator: GeolocatorTokyoConverter['getConverter'] =
	(geolocator, options) => () =>
		new IconLayer({
			id: getIdFromGeolocator(geolocator),
			data: [geolocator],
			iconAtlas: geolocatorIcon,
			iconMapping: ICON_MAPPING,
			getIcon: (d) => 'geolocator',
			getSize: 24,
			getPosition: (d) => [d.coords.longitude, d.coords.latitude]
		});
export const geolocatorTokyoConverter: GeolocatorTokyoConverter = {
	getId: getIdFromGeolocator,
	getConverter: getConverterFromGeolocator
};

function getIdFromGeolocator(geolocator: GeolocationPosition) {
	return 'Geolocator';
}
