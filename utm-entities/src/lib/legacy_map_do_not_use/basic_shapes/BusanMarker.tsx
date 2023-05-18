import L, { Icon, Map, Marker, Polygon } from 'leaflet';
import { autorun, isObservable, makeAutoObservable, reaction, when } from 'mobx';
import { observer } from 'mobx-react';
import colors from '../../../../../../../CIELUM/microutm/libs/yokohama/src/_export.module.scss';
import { useEffect, useMemo, useRef } from 'react';
import { ThreeDimensionalPolygon } from '../entities/ThreeDimensionalPolygon';
import { ThreeDimensionalPoint } from '../entities/ThreeDimensionalPoint';

class MarkerState {
	leafletMarker: Marker;

	constructor(leafletMarker: Marker) {
		this.leafletMarker = leafletMarker;
		makeAutoObservable(this);
	}

	setLatLng(latlng: ThreeDimensionalPoint) {
		this.leafletMarker.setLatLng(latlng);
	}
}

interface MarkerProps {
	point: ThreeDimensionalPoint;
	map: Map; // BusanMapStore
	icon: Icon;
	draggable?: boolean;
}

/* Helpers */
const BusanMarker = (props: MarkerProps) => {
	const { map, point, icon, draggable = false } = props;
	const mapMarker = useMemo(() => {
		const mapMarker = L.marker(
			{ lat: 0, lng: 0 },
			{
				icon,
				draggable: draggable
			}
		);
		mapMarker.addTo(map);
		return mapMarker;
	}, [map]);

	useEffect(() => {
		if (point) mapMarker.setLatLng(point);
	}, [mapMarker, point]);

	useEffect(() => {
		return () => {
			if (mapMarker) mapMarker.remove();
		};
	}, [mapMarker]);

	return null;
};

export default observer(BusanMarker);
