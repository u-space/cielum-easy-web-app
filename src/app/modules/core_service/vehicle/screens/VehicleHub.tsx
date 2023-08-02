import { CustomCell, GridCell, GridCellKind, TextCell } from '@glideapps/glide-data-grid';
import { observer } from 'mobx-react';
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import PButton, { PButtonSize, PButtonType } from '@pcomponents/PButton';
import PTooltip from '@pcomponents/PTooltip';
import GenericHub, { GenericHubProps, rowHeight } from '../../../../commons/screens/GenericHub';
import { useQueryString } from '../../../../utils';
import { useQueryVehicles, useUpdateVehicle, useUpdateVehicleAuthorization } from '../hooks';
import { VehicleAuthorizationStatus, VehicleEntity } from '@utm-entities/vehicle';
import { useVehicleStore } from '../store';
import { shallow } from 'zustand/shallow';
import { useAuthIsAdmin, useAuthIsPilot, useAuthStore } from '../../../auth/store';
import VehicleSearchTools from '../components/VehicleSearchTools';
import ViewAndEditVehicle from '../pages/ViewAndEditVehicle';
import { UseMutationResult } from 'react-query';

const ExtraActions: FC<{ data: VehicleEntity }> = ({ data }) => {
	const { t } = useTranslation();

	const isAdmin = useAuthIsAdmin();

	const updateVehicleAuthorization = useUpdateVehicleAuthorization();

	// Pilot users can de-authorize their own vehicles, but not authorize them
	if (isAdmin) {
		let newAuthorizationStatus: VehicleAuthorizationStatus;
		if (isAdmin) {
			newAuthorizationStatus = data.isAuthorized
				? VehicleAuthorizationStatus.NOT_AUTHORIZED
				: VehicleAuthorizationStatus.AUTHORIZED;
		} else {
			newAuthorizationStatus = data.isAuthorized
				? VehicleAuthorizationStatus.NOT_AUTHORIZED
				: VehicleAuthorizationStatus.PENDING;
		}
		return (
			<PTooltip content={data.isAuthorized ? t('De-authorize') : t('Authorize')}>
				<PButton
					size={PButtonSize.SMALL}
					icon={data.isAuthorized ? 'cross' : 'tick'}
					variant={PButtonType.SECONDARY}
					onClick={() => {
						updateVehicleAuthorization.mutate({
							uvin: data.uvin,
							status: newAuthorizationStatus
						});
					}}
				/>
			</PTooltip>
		);
	} else {
		return null;
	}
};

const VehicleHub = () => {
	// Other hooks
	const { t } = useTranslation();
	const history = useHistory();
	const queryString = useQueryString();

	// State
	const { setFilterProperty, setFilterByText } = useVehicleStore(
		(state) => ({
			setFilterProperty: state.setFilterProperty,
			setFilterByText: state.setFilterByText
		}),
		shallow
	);
	const username = useAuthStore((state) => state.username);
	const isAdmin = useAuthIsAdmin();

	// Props
	const idSelected = queryString.get('id');
	const shouldShowNonAuthorized = queryString.get('pending');
	const columns = [
		{ title: ' ', width: rowHeight * 2 },
		{ title: t('glossary:vehicle.name'), width: 300 },
		{ title: t('glossary:vehicle.authorization'), width: 100 },
		{ title: t('glossary:vehicle.model'), width: 100 },
		{ title: t('glossary:vehicle.owner'), width: 100 }
	];

	// Backend
	const query = useQueryVehicles();
	const { vehicles, count } = query;

	const updateVehicle = useUpdateVehicle();
	const updateVehicleAuthorization = useUpdateVehicleAuthorization();

	// Handlers
	const onEntitySelected = (vehicle: VehicleEntity) =>
		history.replace(vehicle ? `/vehicles?id=${vehicle.uvin}` : '/vehicles');
	function getData([col, row]: readonly [number, number]): GridCell {
		const vehicle = vehicles[row];
		if (vehicle) {
			let data;
			let kind = GridCellKind.Text;
			if (col === 1) {
				data = vehicle.vehicleName;
			} else if (col === 2) {
				data = t(vehicle.authorized);
			} else if (col === 3) {
				data = vehicle.model;
			} else if (col === 4) {
				data = vehicle.owner_id;
			} else if (col === 0) {
				data = '';
				kind = GridCellKind.Custom;
			}

			if (kind === GridCellKind.Text) {
				return {
					kind: GridCellKind.Text,
					data: data,
					displayData: data,
					allowOverlay: false
				} as TextCell;
			} else if (kind === GridCellKind.Custom) {
				return {
					kind: GridCellKind.Custom,
					data: data,
					displayData: data,
					copyData: data,
					allowOverlay: false
				} as CustomCell;
			}
		}
		return {
			kind: GridCellKind.Text,
			data: ' ',
			displayData: ' ',
			allowOverlay: false
		};
	}

	// Effects
	useEffect(() => {
		if (shouldShowNonAuthorized) {
			setFilterProperty('authorized');
			setFilterByText('PENDING');
		}
	}, [shouldShowNonAuthorized]);

	return (
		<GenericHub<VehicleEntity>
			idProperty={'uvin'}
			extraActions={ExtraActions as GenericHubProps<VehicleEntity>['extraActions']}
			getData={getData}
			entitySearchTools={VehicleSearchTools}
			entityPage={ViewAndEditVehicle}
			columns={columns}
			entityName={'vehicle'}
			useStore={useVehicleStore}
			entities={vehicles}
			onEntitySelected={onEntitySelected}
			idSelected={idSelected}
			updateQuery={updateVehicle as UseMutationResult}
			extraIsLoading={updateVehicleAuthorization.isLoading}
			query={{ ...query, count }}
			canEdit={(vehicle) => vehicle?.owner?.username === username || isAdmin}
		/>
	);
};

export default observer(VehicleHub);
