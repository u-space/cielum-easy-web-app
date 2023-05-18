import L, { LeafletEvent, Map, Polygon } from 'leaflet';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react';
import colors from '../../../../../../../CIELUM/microutm/libs/yokohama/src/_export.module.scss';
import { useEffect, useMemo, useRef } from 'react';
import { ThreeDimensionalPolygon } from '../entities/ThreeDimensionalPolygon';
import { ThreeDimensionalPoint } from '../entities/ThreeDimensionalPoint';
import { TwoDimensionalPolygon } from '../entities/TwoDimensionalPolygon';

class PolygonState {
	leafletPolygon: Polygon;

	constructor(leafletPolygon: Polygon) {
		this.leafletPolygon = leafletPolygon;
		makeAutoObservable(this);
	}

	setLatLngs(latlngs: Array<ThreeDimensionalPoint>) {
		this.leafletPolygon.setLatLngs(latlngs);
	}
}

const usePolygonStore = (leafletPolygon: Polygon, map: Map) => {
	const polygonState = useRef<PolygonState>(new PolygonState(leafletPolygon));
	leafletPolygon.addTo(map);
	return polygonState.current;
};

interface PolygonProps {
	polygon: ThreeDimensionalPolygon | TwoDimensionalPolygon;
	map: Map; // BusanMapStore
	color?: string;
	tooltipText?: string;
	tooltipClass?: string;
	onClick?: (evt: LeafletEvent) => void;
}

/* Helpers */
const BusanPolygon = (props: PolygonProps) => {
	const {
		map,
		polygon,
		color = colors['madrid_ramen_800'],
		tooltipText,
		tooltipClass = 'defaultTooltip',
		onClick
	} = props;
	const mapPolygon = useMemo(() => {
		const mapPolygon = L.polygon([], {
			color: color,
			weight: 2,
			dashArray: '8',
			fillOpacity: 0.2,
			lineJoin: 'miter',
			bubblingMouseEvents: true
		});
		mapPolygon.addTo(map);
		if (onClick) mapPolygon.on('click', (evt) => onClick(evt));
		return mapPolygon;
	}, [map]);

	useEffect(() => {
		if (polygon) {
			if (polygon.coordinates) {
				mapPolygon.setLatLngs([
					polygon.coordinates[0].map((lnglat: any) => [lnglat[1], lnglat[0]])
				]);
			} else {
				mapPolygon.setLatLngs(polygon.latlngs);
			}
		}
	}, [mapPolygon, polygon, polygon.latlngs]);

	useEffect(() => {
		if (tooltipText && mapPolygon)
			mapPolygon
				.bindTooltip(tooltipText, {
					direction: 'center',
					permanent: true,
					interactive: true,
					className: tooltipClass
				})
				.openTooltip();
	}, [mapPolygon, tooltipText, tooltipClass]);

	useEffect(() => {
		return () => {
			if (mapPolygon) mapPolygon.remove();
		};
	}, [mapPolygon]);

	return null;
};

export default observer(BusanPolygon);
