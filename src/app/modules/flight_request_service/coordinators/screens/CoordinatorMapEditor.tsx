// import { CoordinatorEntity } from '@flight-request-entities/coordinator';
// import { PButtonProps } from '@pcomponents/PButton';
// import { PFullModalProps } from '@pcomponents/PFullModal';
// import { useTokyo } from '@tokyo/store';
// import { EditMode } from '@tokyo/types';
// import { Polygon } from 'geojson';
// import _ from 'lodash';
// import { observer } from 'mobx-react';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { useQueryClient } from 'react-query';
// import { useHistory } from 'react-router-dom';
// import { reactify } from 'svelte-preprocess-react';
// import MapLayout from '../../../../commons/layouts/MapLayout';
// import { useQueryString } from '../../../../utils';
// import EditorMapViewSvelte from '../../../map/screens/editor/EditorMapView.svelte';
// import { EditorMapViewProps } from '../../../map/screens/editor/EditorMapViewProps';
// import { useQueryGeographicalZones } from '../../geographical_zone/hooks';
// import InfoCoordinator from '../components/InfoCoordinator';
// import { useQueryCoordinators, useUpdateCoordinator } from '../hooks';
// import { GeographicalZone } from '@flight-request-entities/geographicalZone';

// const EditorMapView = reactify(EditorMapViewSvelte);

const CoordinatorMapEditor = () => {
	return null;
	// const { t } = useTranslation(['ui', 'glossary']);
	// const history = useHistory();
	// const queryString = useQueryString();

	// const id = queryString.get('id');

	// const queryCoordinator = useQueryCoordinators(true);
	// const tokyo = useTokyo();

	// const queryGeographicalZones = useQueryGeographicalZones(true);

	// const [modalProps, setModalProps] = useState<PFullModalProps | undefined>(undefined);
	// const [selectedVolume, setSelectedVolume] = useState<number | null>(null);

	// const coordinator = useMemo(() => {
	// 	// if (queryCoordinator.isSuccess) {
	// 	// 	return queryCoordinator.data?.data;
	// 	// } else {
	// 	return new CoordinatorEntity({});
	// 	// }
	// }, [queryCoordinator.data?.data, queryCoordinator.isSuccess]);

	// const polygons = useMemo(() => {
	// 	if (coordinator.geographical_zone instanceof GeographicalZone) {
	// 		return coordinator.geographical_zone.geography
	// 			? [_.cloneDeep(coordinator.geographical_zone.geography)]
	// 			: [];
	// 	} else {
	// 		return [];
	// 	}
	// }, [coordinator]);

	// const onPolygonsUpdated = useCallback(
	// 	(polygons: Polygon[]) => {
	// 		if (coordinator.geographical_zone) {
	// 			if (coordinator.geographical_zone instanceof GeographicalZone) {
	// 				coordinator.geographical_zone.geography = polygons[0];
	// 			}
	// 		}
	// 		// else {
	// 		// 	coordinator.geographical_zone = new GeographicalZone({ geography: polygons[0] });
	// 		// }
	// 	},
	// 	[coordinator]
	// );

	// const queryClient = useQueryClient();
	// const saveCoordinatorMutation = useUpdateCoordinator(id != undefined);
	// // 	(() =>
	// // 		setModalProps({
	// // 			isVisible: true,
	// // 			type: PModalType.SUCCESS,
	// // 			title: t('Success'),
	// // 			content: t('The Rfv was created successfully'),
	// // 			primary: {
	// // 				onClick: () => {
	// // 					queryClient.invalidateQueries('rfvs').then();
	// // 					history.push('/rfvs');
	// // 				}
	// // 			}
	// // 		}),
	// // 	(error) =>
	// // 		setModalProps({
	// // 			isVisible: true,
	// // 			type: PModalType.ERROR,
	// // 			title: t('An error ocurred while saving'),
	// // 			content: translateErrors(error, 'rfv'),
	// // 			primary: {
	// // 				onClick: resetError
	// // 			}
	// // 		})
	// // );

	// const save: PButtonProps['onClick'] = (evt) => {
	// 	evt.preventDefault();
	// 	saveCoordinatorMutation.mutate({ entity: coordinator });
	// };

	// const resetError = () => {
	// 	setModalProps(undefined);
	// 	saveCoordinatorMutation.reset();
	// };

	// /* -- */

	// useEffect(() => {
	// 	const geography = queryCoordinator.data?.data.geography;
	// 	if (queryCoordinator.isSuccess && geography) {
	// 		tokyo.flyToCenterOfGeometry(geography);
	// 	}
	// }, [queryCoordinator.data?.data.geography, queryCoordinator.isSuccess, tokyo]);

	// const props = _.filter(_.keys(coordinator), (key) => key !== 'id');

	// const editorMapViewProps: EditorMapViewProps = {
	// 	geographicalZones: queryGeographicalZones.items,
	// 	editOptions: {
	// 		mode: EditMode.SINGLE,
	// 		polygons
	// 	},
	// 	flightRequests:[]
	// };
	// return (
	// 	<MapLayout
	// 		isLoading={{
	// 			menu: saveCoordinatorMutation.isLoading || saveCoordinatorMutation.isSuccess,
	// 			main: saveCoordinatorMutation.isLoading
	// 		}}
	// 		menu={
	// 			<InfoCoordinator
	// 				coordinator={coordinator}
	// 				isEditingExisting={id != undefined}
	// 				props={props}
	// 				save={save}
	// 			/>
	// 		}
	// 		statusOverlay={{
	// 			text: `### ${t('You are in EDITOR MODE')} `
	// 		}}
	// 		modal={modalProps}
	// 	>
	// 		<EditorMapView
	// 			{...editorMapViewProps}
	// 			onSelect={(e) => setSelectedVolume((e as CustomEvent<number>).detail)}
	// 			onEdit={(e) => onPolygonsUpdated((e as CustomEvent<Polygon[]>).detail)}
	// 		/>
	// 	</MapLayout>
	// );
};

// export default observer(CoordinatorMapEditor);
