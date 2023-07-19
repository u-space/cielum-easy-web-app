import type { AxiosResponseTransformer } from 'axios';
import Axios from 'axios';

const geocoderAxiosInstance = Axios.create({
	baseURL: 'https://api.geoapify.com/v1/geocode',
	headers: {}
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformAutocomplete = (response: any) => response?.results;

export const getAutocomplete = (geoapifyApiKey: string) => (value: string) => {
	return geocoderAxiosInstance.get('autocomplete', {
		params: { text: value, apiKey: geoapifyApiKey, format: 'json' },
		transformResponse: (Axios.defaults.transformResponse as AxiosResponseTransformer[]).concat(
			transformAutocomplete
		)
	});
};

export const getSearch = (geoapifyApiKey: string) => (value: string) => {
	return geocoderAxiosInstance.get('search', {
		params: { text: value, apiKey: geoapifyApiKey, format: 'json' },
		transformResponse: (Axios.defaults.transformResponse as AxiosResponseTransformer[]).concat(
			transformAutocomplete
		)
	});
};

export interface GeoapifyPlace {
	place_id: string;
	lon: number;
	lat: number;
	formatted: string;
}
