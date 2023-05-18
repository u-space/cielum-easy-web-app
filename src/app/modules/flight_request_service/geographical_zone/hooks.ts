import { useQuery } from 'react-query';
import { useFlightRequestServiceAPI, useQueryString } from '../../../utils';
import { useEffect, useMemo } from 'react';
import { MIN_ZOOM_LEVEL_DETAILED_FEATURES } from '@flight-request-entities/consts';
import { useTranslation } from 'react-i18next';
import { useTokyo } from '@tokyo/TokyoStore';
import { polygon } from '@turf/helpers';
import { useGeographicalZoneStore } from './store';
import { Polygon } from 'geojson';

export function useSelectedGeographicalZone() {
	const queryString = useQueryString();
	const {
		geographicalZone: { getGeographicalZone }
	} = useFlightRequestServiceAPI();

	const idGz = queryString.get('geographical-zone');
	const prev = queryString.get('prev');
	const querySelectedGz = useQuery(
		['geographicalZone', idGz],
		() => getGeographicalZone(idGz || ''),
		{
			enabled: false
		}
	);

	useEffect(() => {
		if (idGz) {
			querySelectedGz.refetch();
		}
	}, [idGz]);

	const gz = querySelectedGz?.data?.data;

	return {
		gz,
		selected: { geographicalZone: idGz, prev: prev ? prev.replace(/'/g, '') : undefined },
		query: querySelectedGz
	};
}

export function useQueryGeographicalZonesIntersectingPolygon(polygon: Polygon) {
	const {
		geographicalZone: { getGeographicalZonesIntersecting }
	} = useFlightRequestServiceAPI();
	const query = useQuery(
		['intersectingPolygonCoordinations', polygon],
		() => getGeographicalZonesIntersecting(polygon),
		{
			enabled: !!polygon
		}
	);
	const intersections = query.data?.data.geographicalZones;
	return { intersections, isLoading: query.isLoading };
}

export function useQueryGeographicalZones(all = false) {
	const { t } = useTranslation();

	const {
		geographicalZone: { getGeographicalZones }
	} = useFlightRequestServiceAPI();

	const pageTake = useGeographicalZoneStore((state) => state.pageTake);
	const pageSkip = useGeographicalZoneStore((state) => state.pageSkip);
	const sortingProperty = useGeographicalZoneStore((state) => state.sortingProperty);
	const sortingOrder = useGeographicalZoneStore((state) => state.sortingOrder);
	const filterProperty = useGeographicalZoneStore((state) => state.filterProperty);
	const filterMatchingText = useGeographicalZoneStore((state) => state.filterMatchingText);

	const tokyo = useTokyo();
	const lng = tokyo?.viewState?.longitude;
	const lat = tokyo?.viewState?.latitude;
	const zoom = tokyo?.viewState?.zoom;
	const box = useMemo(() => {
		return lat && lng && all && zoom && zoom >= MIN_ZOOM_LEVEL_DETAILED_FEATURES
			? polygon([
					[
						[lng - 0.1, lat - 0.05],
						[lng + 0.1, lat - 0.05],
						[lng + 0.1, lat + 0.05],
						[lng - 0.1, lat + 0.05],
						[lng - 0.1, lat - 0.05]
					]
			  ])
			: null;
	}, [lng, lat, zoom, all]);

	const {
		isLoading,
		isSuccess,
		isError,
		data: responseGeographicalZones,
		isPreviousData,
		isFetching,
		error
	} = useQuery(
		[
			'geographicalZones',
			pageTake,
			pageSkip,
			sortingProperty,
			sortingOrder,
			filterProperty,
			filterMatchingText,
			box
		],
		() =>
			getGeographicalZones(
				all ? 9999 : pageTake,
				all ? 0 : pageSkip,
				sortingProperty,
				sortingOrder,
				filterProperty,
				filterMatchingText,
				all && box
					? box.geometry
					: all
					? {
							type: 'Polygon',
							coordinates: [
								[
									[-0.01, -0.01],
									[0.01, -0.01],
									[-0.01, 0.01],
									[0.01, 0.01],
									[-0.01, -0.01]
								]
							]
					  }
					: undefined
			),
		{ keepPreviousData: true }
	);

	const data = isSuccess ? responseGeographicalZones.data : null;
	const items = isSuccess ? responseGeographicalZones.data.geographicalZones : [];
	const count = data ? data.count : 0;
	let statusMessage;
	if (isLoading) {
		statusMessage = `**${t('MAP INCOMPLETE')}**:  ${t('Loading information from the server')}`;
	} else if (tokyo?.viewState?.zoom && tokyo.viewState.zoom < MIN_ZOOM_LEVEL_DETAILED_FEATURES) {
		statusMessage = `**${t('MAP INCOMPLETE')}**:  ${t('Zoom in to see more information')}`;
	}

	return {
		items,
		count,
		data,
		isPreviousData,
		isLoading,
		isSuccess,
		isError,
		isFetching,
		error,
		statusMessage
	};
}
