import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTokyo } from '@tokyo/store';
import PlanningMapViewSvelte from '../../../map/screens/planning/PlanningMapView.svelte';
import PButton from '@pcomponents/PButton';
import { reactify } from 'svelte-preprocess-react';
import ViewAndEditFlightRequest from '../pages/ViewAndEditFlightRequest';
import { useLs } from '../../../../commons/utils';
import { useQueryFlightRequests, useSelectedFlightRequest } from '../hooks';
import { useQueryGeographicalZones } from '../../geographical_zone/hooks';
import MapLayout from '../../../../commons/layouts/MapLayout';
import { PlanningMapViewProps } from '../../../map/screens/planning/PlanningMapViewProps';
import { FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { useEffectDebugger } from '../../../../../useEffectDebugger';

const PlanningMapView = reactify(PlanningMapViewSvelte);

const PlanningMap = () => {
	const { t } = useTranslation();
	const history = useHistory();
	const queryFlightRequests = useQueryFlightRequests(true);
	const queryGeographicalZones = useQueryGeographicalZones(true);
	const isLoading = queryFlightRequests.isLoading;
	const defaultSideWidth = getComputedStyle(document.documentElement).getPropertyValue(
		'--side-width-default'
	);
	const fullSideWidth = getComputedStyle(document.documentElement).getPropertyValue(
		'--side-width-full'
	);

	const tokyo = useTokyo();
	const { flightRequest, selected } = useSelectedFlightRequest();

	const ls = useLs(new FlightRequestEntity());

	useEffect(() => {
		if (flightRequest) {
			tokyo.flyToCenterOfGeometry(flightRequest.volumes[0].operation_geography);
			ls.entity = flightRequest;
		}
	}, [flightRequest]);

	useEffect(() => {
		document.documentElement.style.setProperty('--side-width', fullSideWidth);
		return () => {
			document.documentElement.style.setProperty('--side-width', defaultSideWidth);
		};
	}, []);

	const planningMapViewProps: PlanningMapViewProps = useMemo(() => {
		return {
			flightRequests: flightRequest ? [flightRequest] : [],
			geographicalZones: queryGeographicalZones.items,
			selected
		};
	}, [flightRequest, queryGeographicalZones.items, selected]);

	return (
		<MapLayout
			isLoading={{ main: isLoading }}
			menu={
				<div
					style={{
						backgroundColor: 'hsl(220deg, 10%, 90%)',
						display: 'flex',
						flexDirection: 'column',
						width: '100%'
					}}
				>
					<div
						style={{
							padding: '1rem',
							display: 'flex',
							flexDirection: 'column',
							gap: '1rem'
						}}
					>
						<PButton onClick={() => history.push(`/flight-requests`)}>
							{t('View all flight requests')}
						</PButton>
						<PButton
							onClick={() =>
								history.push(`/flight-requests?id=${selected.flightRequest}`)
							}
						>
							{t('Edit')}
						</PButton>
					</div>
					<ViewAndEditFlightRequest isEditing={false} ls={ls} style={{ width: '100%' }} />
				</div>
			}
		>
			<PlanningMapView {...planningMapViewProps} />
		</MapLayout>
	);
};

export default observer(PlanningMap);
