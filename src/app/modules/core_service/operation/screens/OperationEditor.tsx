import { PButtonProps } from '@pcomponents/PButton';
import { PModalType } from '@pcomponents/PModal';
import { useTokyo } from '@tokyo/store';
import { translateErrors } from '@utm-entities/_util';
import { Polygon } from 'geojson';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import MapLayout from '../../../../commons/layouts/MapLayout';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import ContextualInfo from '../../../../commons/layouts/map/editor_map/ContextualInfo';
import { useQueryString } from '../../../../utils';
import { useQueryGeographicalZones } from '../../../flight_request_service/geographical_zone/hooks';
import MapViewModeSwitch from '../../../map/components/MapViewModeSwitch';
import EditorMapViewSvelte from '../../../map/screens/editor/EditorMapView.svelte';
import { useSchemaStore } from '../../../schemas/store';
import InfoOperation from '../components/InfoOperation';
import { useQueryOperation, useSaveOperation } from '../hooks';

import { PFullModalProps, undefinedModal } from '@pcomponents/PFullModal';
import { EditMode } from '@tokyo/types';
import { UserEntity } from '@utm-entities/user';
import { Operation } from '@utm-entities/v2/model/operation';
import { OperationVolume } from '@utm-entities/v2/model/operation_volume';
import { NestedUser } from '@utm-entities/v2/model/user';
import { reactify } from 'svelte-preprocess-react';
import { useAuthStore } from '../../../auth/store';
import { EditorMapViewProps } from '../../../map/screens/editor/EditorMapViewProps';
import { useQueryUser } from '../../user/hooks';
import { useOwnedFlightRequests } from 'src/app/modules/flight_request_service/flight_request/hooks';
import { FlightRequestEntity } from '@flight-request-entities/flightRequest';

const EditorMapView = reactify(EditorMapViewSvelte);

const transformOperationCheckError = (input: string): [string, string] => {
	console.log('transformOperationCheckError: ', input);
	const regex = /Need coordination for zone (.+)/;
	const match = input.match(regex);
	if (match) {
		const zone = match[1];
		const transformed = input.replace(zone, 'x');
		return [transformed, zone];
	} else return [input, ''];
};

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
	const frQuery = useOwnedFlightRequests();
	const flightRequests: FlightRequestEntity[] = frQuery.flightRequests;

	const [modalProps, setModalProps] = useState<PFullModalProps>(undefinedModal);
	const [selectedVolume, setSelectedVolume] = useState<number | null>(null);

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
				operation.set(
					'contact_phone',
					String(user.extra_fields.phone) || t('The user has no known phone')
				);
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

	const delayedSelection = (index: number | null) => {
		setTimeout(() => {
			setSelectedVolume(index);
		}, 500);
	};

	useEffect(() => {
		const geography = queryOperation.data?.operation_volumes[0].operation_geography;
		if (queryOperation.isSuccess && geography) {
			tokyo.flyToCenterOfGeometry(geography);
		}
	}, [queryOperation.data?.operation_volumes, queryOperation.isSuccess]);

	const onPolygonsUpdated = (polygons: Polygon[]) => {
		let globalIndex = 0;
		setOperation((prev) => {
			const newOperation = new Operation();
			for (const prop in prev) {
				newOperation.set(prop as keyof Operation, prev[prop as keyof Operation]);
			}
			newOperation.operation_volumes = polygons.map((polygon, index) => {
				const volume = new OperationVolume();
				volume.set('ordinal', index);
				if (index < newOperation.operation_volumes.length) {
					const existingVolume = newOperation.operation_volumes[index];
					for (const prop in existingVolume) {
						volume.set(prop, existingVolume.get(prop));
					}
				}
				volume.set('operation_geography', polygon);
				globalIndex = index;
				return volume;
			});
			return newOperation;
		});
		delayedSelection(globalIndex);
	};

	const queryClient = useQueryClient();
	const saveOperationMutation = useSaveOperation(
		() => {
			console.log('saveOperationMutation.mutate: ', operation);
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
			});
		},
		(error: any) => {
			console.log('Error occurred:', error);
			const errorMessages = [];

			if (typeof error !== 'string' && error.response?.data) {
				try {
					errorMessages.push(...error.response.data.message.split(',').map((errorText: string) => {
						const [transformedError, zone] = transformOperationCheckError(errorText.trim());
						return zone ? t(transformedError, { x: zone }) : t(transformedError);
					}));
				} catch (e) {
					console.error('Error parsing error messages:', e);
				}
			}

			const needCoordination = error.response?.data.message.includes('Need coordination');
			if (needCoordination) {
				errorMessages.push(t('You will be redirected to the soca creation'));
			}

			setModalProps({
				isVisible: true,
				type: PModalType.ERROR,
				title: t('An error occurred while saving'),
				content: needCoordination ? errorMessages : translateErrors(error, 'operation'),
				primary: {
					onClick: () => {
						resetError();
						if (needCoordination) {
							const vol = operation.operation_volumes[0];
							const geo = operation.operation_volumes.length === 1 ? vol.operation_geography : '';
							const volumeData = operation.operation_volumes.length === 1 ? {
								effective_time_begin: vol.effective_time_begin,
								effective_time_end: vol.effective_time_end,
								min_altitude: vol.min_altitude,
								max_altitude: vol.max_altitude,
								beyond_visual_line_of_sight: vol.beyond_visual_line_of_sight
							} : undefined;
							history.push(`/editor/flightRequest/${JSON.stringify({ ...geo })}${volumeData ? `/${JSON.stringify(volumeData)}` : ''}`);
						}
					}
				}
			});
		}
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
		editOptions: {
			polygons,
			mode: EditMode.MULTI
		},
		geographicalZones: queryGeographicalZones.items,
		flightRequests: flightRequests
	};

	return (
		<MapLayout
			isLoading={{
				// menu: saveOperationMutation.isLoading || saveOperationMutation.isSuccess,
				menu: saveOperationMutation.isLoading,
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
						<CardGroup
							header={t('Operation volume x', { x: selectedVolume + 1 })}
							headerTooltipContent={
								<div
									style={{
										padding: '10px',
										backgroundColor: 'white',
										borderRadius: '5px'
									}}
								>
									<p>{t('Select the volume')}</p>
									<select>
										{operation.operation_volumes.map((volume, index) => (
											<option
												key={`${operation.name}-${index}`}
												selected={index === selectedVolume}
												value={index}
												onClick={() => setSelectedVolume(index)}
											>
												{t('Operation volume x', { x: index + 1 })}
											</option>
										))}
									</select>
								</div>
							}
						>
							<ContextualInfo
								entity={operation.operation_volumes[selectedVolume]}
								entityName={'volume'}
								hiddenProps={['ordinal', 'id', 'near_structure']}
							/>
						</CardGroup>
					)}
					<MapViewModeSwitch />
				</>
			}
			statusOverlay={{
				text: polygons.length > 0 ? `### ${t('You are in EDITOR MODE')} ` : `### ${t('Please draw a polygon to continue')}`
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
