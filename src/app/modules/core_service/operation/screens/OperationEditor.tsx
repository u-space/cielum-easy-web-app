import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import _ from 'lodash';
import { PModalType } from '@pcomponents/PModal';
import { translateErrors } from '@utm-entities/_util';
import { useHistory } from 'react-router-dom';
import { useQueryGeographicalZones } from '../../../flight_request_service/geographical_zone/hooks';
import { useTokyo } from '@tokyo/store';
import { useQueryOperation, useSaveOperation } from '../hooks';
import { useQueryString } from '../../../../utils';
import { useSchemaStore } from '../../../schemas/store';
import { Polygon } from 'geojson';
import MapLayout from '../../../../commons/layouts/MapLayout';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import { PButtonProps } from '@pcomponents/PButton';
import InfoOperation from '../components/InfoOperation';
import ContextualInfo from '../../../../commons/layouts/map/editor_map/ContextualInfo';
import MapViewModeSwitch from '../../../map/components/MapViewModeSwitch';
import EditorMapViewSvelte from '../../../map/screens/editor/EditorMapView.svelte';

import { reactify } from 'svelte-preprocess-react';
import { PFullModalProps, undefinedModal } from '@pcomponents/PFullModal';
import { EditorMapViewProps } from '../../../map/screens/editor/EditorMapViewProps';
import { EditMode } from '@tokyo/types';
import { Operation } from '@utm-entities/v2/model/operation';
import { OperationVolume } from '@utm-entities/v2/model/operation_volume';
import { useAuthStore } from '../../../auth/store';
import { UserEntity } from '@utm-entities/user';
import { NestedUser } from '@utm-entities/v2/model/user';
import { useQueryUser } from '../../user/hooks';

const EditorMapView = reactify(EditorMapViewSvelte);

const OperationEditor = () => {
	const { t } = useTranslation(['ui', 'glossary']);
	const history = useHistory();
	const queryString = useQueryString();

	const id = queryString.get('id');
	const queryOperation = useQueryOperation(id || '', false);
	const tokyo = useTokyo();

	const username = useAuthStore((state) => state.username);

	const queryUser = useQueryUser(username, true);

	const schemaVehicles = useSchemaStore((state) => state.vehicles);
	const schemaUsers = useSchemaStore((state) => state.users);

	const queryGeographicalZones = useQueryGeographicalZones(true);

	const [modalProps, setModalProps] = useState<PFullModalProps>(undefinedModal);
	const [selectedVolume, setSelectedVolume] = useState<number | null>(null);

	/*const operation = useMemo(() => {
		/* op.set(
					'creator',
					new NestedUser({
						// TODO: Remove this when creating ExistingOperation, NewOperation
						username,
						email: '',

						firstName: '',
						lastName: '',
						extra_fields_json: {}
					})
				);
				op.set(
					'owner',
					new NestedUser({
						// TODO: Remove this when creating ExistingOperation, NewOperation
						username,
						email: '',

						firstName: '',
						lastName: '',
						extra_fields_json: {}
					})
				);
		return new Operation();
	}, []);*/

	const [operation, setOperation] = useState<Operation>(new Operation());

	useEffect(() => {
		if (queryUser.isSuccess) {
			const user: UserEntity = queryUser.data?.data;
			if (operation.owner === null) {
				operation.set(
					'owner',
					new NestedUser({
						...user
					})
				);
				operation.set('contact', user.fullName);
				operation.set('contact_phone', user.phone || t('The user has no known phone'));
			}
		}
	}, [queryUser, operation]);

	useEffect(() => {
		if (!!id && !queryOperation.isSuccess && !queryOperation.isError) {
			queryOperation.refetch().then((response) => {
				if (response.data) setOperation(response.data);
			});
		}
	}, [id, queryOperation.isSuccess, queryOperation.isError, queryOperation.refetch]);

	const polygons = useMemo(() => {
		return _.cloneDeep(
			operation.operation_volumes.flatMap((volume) =>
				volume.operation_geography ? volume.operation_geography : []
			)
		);
	}, [operation]);

	useEffect(() => {
		const geography = queryOperation.data?.operation_volumes[0].operation_geography;
		if (queryOperation.isSuccess && geography) {
			tokyo.flyToCenterOfGeometry(geography);
		}
	}, [queryOperation.data?.operation_volumes, queryOperation.isSuccess]);

	const onPolygonsUpdated = (polygons: Polygon[]) => {
		setOperation((prev) => {
			const operation = new Operation();
			for (const prop in prev) {
				operation.set(prop as keyof Operation, prev[prop as keyof Operation]);
			}
			operation.operation_volumes = polygons.map((polygon, index) => {
				const volume = new OperationVolume();
				volume.set('ordinal', index);
				volume.set('effective_time_begin', new Date());
				volume.set('effective_time_end', new Date());
				if (index < operation.operation_volumes.length) {
					const existingVolume = operation.operation_volumes[index];
					for (const prop in existingVolume) {
						volume.set(prop, existingVolume.get(prop));
					}
				}
				volume.set('operation_geography', polygon);
				return volume;
			});
			return operation;
		});
	};

	const queryClient = useQueryClient();
	const saveOperationMutation = useSaveOperation(
		() =>
			setModalProps({
				isVisible: true,
				type: PModalType.SUCCESS,
				title: t('Success'),
				content: t('The Operation was created successfully'),
				primary: {
					onClick: () => {
						queryClient.invalidateQueries('operations').then();
						history.push('/map');
					}
				}
			}),
		(error) =>
			setModalProps({
				isVisible: true,
				type: PModalType.ERROR,
				title: t('An error ocurred while saving'),
				content: translateErrors(error, 'operation'),
				primary: {
					onClick: resetError
				}
			})
	);

	const save: PButtonProps['onClick'] = (evt) => {
		evt.preventDefault();
		saveOperationMutation.mutate({ entity: operation, documents: new Map(), isCreating: !id });
	};

	const resetError = () => {
		setModalProps(undefinedModal);
		saveOperationMutation.reset();
	};

	/* -- */

	const props = _.filter(_.keys(operation), (key) => key !== 'gufi' && key !== 'state');

	const editorMapViewProps: EditorMapViewProps = {
		/*handlers: {
			edit: onPolygonsUpdated,
			editingPolygonSelect: setSelectedVolume
		},*/
		editOptions: {
			polygons,
			mode: EditMode.MULTI
		},
		geographicalZones: queryGeographicalZones.items
	};

	return (
		<MapLayout
			isLoading={{
				menu: saveOperationMutation.isLoading || saveOperationMutation.isSuccess,
				main: saveOperationMutation.isLoading
			}}
			menu={
				<InfoOperation
					operation={operation}
					{...{
						schemaUsers,
						schemaVehicles,

						isEditingExisting: queryOperation.isSuccess,
						props,
						volumeProps: [],
						save
					}}
				/>
			}
			contextual={
				<>
					{selectedVolume !== null && (
						<CardGroup header={t('Operation volume x', { x: selectedVolume + 1 })}>
							<ContextualInfo
								entity={operation.operation_volumes[selectedVolume]}
								entityName={'volume'}
								hiddenProps={['ordinal', 'id']}
							/>
						</CardGroup>
					)}
					<MapViewModeSwitch />
				</>
			}
			statusOverlay={{
				text: `### ${t('You are in EDITOR MODE')} `
			}}
			modal={modalProps}
		>
			<EditorMapView
				{...editorMapViewProps}
				onSelect={(e) => setSelectedVolume((e as CustomEvent<number>).detail)}
				onEdit={(e) => onPolygonsUpdated((e as CustomEvent<Polygon[]>).detail)}
			/>
		</MapLayout>
	);
};

export default observer(OperationEditor);
