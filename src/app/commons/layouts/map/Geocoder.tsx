import Axios, { AxiosResponse, AxiosResponseTransformer } from 'axios';
import _ from 'lodash';
import { FC, KeyboardEventHandler, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import PInput from '@pcomponents/PInput';
import { useTokyo } from '@tokyo/TokyoStore';
import env from '../../../../vendor/environment/env';
import { getWebConsoleLogger } from '../../../../utils';
const geocoderAxiosInstance = Axios.create({
	baseURL: 'https://api.geoapify.com/v1/geocode',
	headers: {}
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformAutocomplete = (response: any) => response?.results;

const getAutocomplete = (value: string) => {
	return geocoderAxiosInstance.get('autocomplete', {
		params: { text: value, apiKey: env.API_keys.geoapify, format: 'json' },
		transformResponse: (Axios.defaults.transformResponse as AxiosResponseTransformer[]).concat(
			transformAutocomplete
		)
	});
};

const getSearch = (value: string) => {
	return geocoderAxiosInstance.get('search', {
		params: { text: value, apiKey: env.API_keys.geoapify, format: 'json' },
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
const Geocoder: FC<{ onResults: (places: GeoapifyPlace[]) => void }> = ({ onResults }) => {
	const { t } = useTranslation();
	const tokyo = useTokyo();
	const [value, setValue] = useState<string>('');

	const query = useQuery(['geoapify-autocomplete', value], () => getAutocomplete(value), {
		retry: false,
		enabled: false
	});

	const querySearch = useQuery(['geoapify-search', value], () => getSearch(value), {
		retry: false,
		enabled: false
	});

	const queryRefetchDebounced = _.debounce(query.refetch, 500, {
		trailing: true,
		leading: false
	});

	const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (evt) => {
		if (evt.key === 'Enter') {
			querySearch.refetch();
		}
	};

	useEffect(() => {
		if (value) {
			queryRefetchDebounced();
		}
	}, [value]);

	useEffect(() => {
		if (querySearch.data) {
			const place = querySearch.data.data[0];
			if (place) tokyo.flyTo(place.lon, place.lat);
		}
	}, [querySearch.data]);

	useEffect(() => {
		if (query.data) {
			onResults(query.data.data);
		} else {
			onResults([]);
		}
	}, [query.data]);

	useEffect(() => {
		if (!env.API_keys.geoapify)
			getWebConsoleLogger().getErrorForDeveloperToFix(
				'Missing GEOAPIFY_API_KEY, the Geocoder feature is enabled. Please disable the Geocoder in the Tenant configuration'
			);
	}, []);

	return (
		<PInput
			placeholder={t('Search for a place')}
			id="map-geocoder"
			onKeyDown={onKeyDown}
			onChange={setValue}
		/>
	);
};

export default Geocoder;
