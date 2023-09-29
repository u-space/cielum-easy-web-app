import {
	useQueryOperations,
	useSelectedOperationAndVolume
} from '../../core_service/operation/hooks';
import _ from 'lodash';
import { useAuthIsAdmin, useAuthStore } from '../../auth/store';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelectedGeographicalZone } from '../../flight_request_service/geographical_zone/hooks';
import { useSelectedRfv } from '../../core_service/rfv/hooks';
import { useSelectedUvr } from '../../core_service/uvr/hooks';
import { useSelectedVehicle } from '../../core_service/vehicle/hooks';
import OperationDetails from './OperationDetails';
import GenericEntityDetails from './GenericEntityDetails';
import PButton from '@pcomponents/PButton';
import VehicleDetails from './VehicleDetails';
import OperationListAndStateFilters from './OperationListAndStateFilters';
import CardGroup from '../../../commons/layouts/dashboard/menu/CardGroup';
import { Checkbox, IconName } from '@blueprintjs/core';
import { getFeatureOption } from '../../../utils';
import env from '../../../../vendor/environment/env';

const Menu = ({
	isShowingGeographicalZones,
	setShowingGeographicalZonesFlag,
	isShowingUvrs,
	setShowingUvrsFlag
}: {
	isShowingGeographicalZones: boolean;
	setShowingGeographicalZonesFlag: (flag: boolean) => void;
	isShowingUvrs: boolean;
	setShowingUvrsFlag: (flag: boolean) => void;
}) => {
	const { t } = useTranslation();
	const history = useHistory();
	const isAdmin = useAuthIsAdmin();
	const username = useAuthStore((state) => state.username);
	const queryOperations = useQueryOperations();
	const { operation, selected: operationSelection } = useSelectedOperationAndVolume();
	const { gz, selected: gzSelection, query: querySelectedGz } = useSelectedGeographicalZone();
	const {
		vehicle,
		latestPosition,
		selected: vehicleSelection,
		query: querySelectedVehicle
	} = useSelectedVehicle();
	const { rfv, selected: rfvSelection, query: querySelectedRfv } = useSelectedRfv();
	const { uvr, selected: uvrSelection, query: querySelectedUvr } = useSelectedUvr();

	if (operationSelection.gufi && operation) {
		// Show details of selected operation
		return (
			<OperationDetails
				{...queryOperations}
				operation={operation}
				canEdit={
					(isAdmin ||
						(operation?.owner?.username === username &&
							operation?.state !== 'CLOSED')) &&
					operation?.operation_volumes?.length === 1
				}
			/>
		);
	} else if (gzSelection.geographicalZone) {
		// Show details of selected geographical zone
		return (
			<GenericEntityDetails
				route={gzSelection.prev ? `${gzSelection.prev}?is-previous=true` : '/map'}
				isLoading={querySelectedGz.isLoading}
				isSuccess={querySelectedGz.isSuccess}
				isError={querySelectedGz.isError}
				entity={
					gz
						? isAdmin
							? {
									name: gz.name,
									coordinator_email: gz.coordinator?.email,
									coordinator_phone: gz.coordinator?.telephone
							  }
							: { name: gz.name }
						: null
				}
				baseLabelKey={'gz'}
				label={t('Geographical Zone')}
				extra={
					<>
						{!!gz?.coordinator && (
							<p>
								{t(
									'Coordination required for operations in this geographical zone'
								)}
							</p>
						)}
						{!gz?.coordinator && (
							<>
								<h2>{t('This zone does not have an associated coordinator')}</h2>
								{isAdmin && (
									<PButton
										icon="add"
										onClick={() => {
											history.push(
												`/editor/coordinator?geographical-zone=${gz?.id}`
											);
										}}
									>
										{t('Create coordinator')}
									</PButton>
								)}
							</>
						)}
					</>
				}
				canEdit={false}
			/>
		);
	} else if (rfvSelection.rfv) {
		return (
			<GenericEntityDetails
				route={'/map'}
				isLoading={querySelectedRfv.isLoading}
				isSuccess={querySelectedRfv.isSuccess}
				isError={querySelectedRfv.isError}
				entity={rfv}
				baseLabelKey={'rfv'}
				label={t('Restricted Flight Volume')}
				canEdit={false}
				extra={null}
			/>
		);
	} else if (uvrSelection.uvr) {
		return (
			<GenericEntityDetails
				route={'/map'}
				isLoading={querySelectedUvr.isLoading}
				isSuccess={querySelectedUvr.isSuccess}
				isError={querySelectedUvr.isError}
				entity={_.omit(uvr, ['cause', 'permitted_uas', 'required_support', 'type'])}
				baseLabelKey={'uvr'}
				label={t('UAS Volume Reservation')}
				canEdit={false}
				extra={null}
			/>
		);
	} else if (vehicleSelection.gufi) {
		// Show details of selected vehicle and latest positio
		return (
			<VehicleDetails
				vehicle={vehicle}
				latestPosition={latestPosition}
				isLoading={querySelectedVehicle.isLoading}
				isSuccess={querySelectedVehicle.isSuccess}
				isError={querySelectedVehicle.isError}
			/>
		);
	} else {
		// Main screen
		return (
			<>
				{!getFeatureOption('RealtimeMap', 'hideOperationsControls') && (
					<OperationListAndStateFilters />
				)}
				<CardGroup header="Non-realtime information">
					<Checkbox
						labelElement={<span>{t('Show geographical zones')}</span>}
						checked={isShowingGeographicalZones}
						onChange={() =>
							setShowingGeographicalZonesFlag(!isShowingGeographicalZones)
						}
					/>
					<Checkbox
						labelElement={<span>{t('Show NOTAMs')}</span>}
						checked={isShowingUvrs}
						onChange={() => setShowingUvrsFlag(!isShowingUvrs)}
					/>
				</CardGroup>
			</>
		);
	}
};

export default Menu;
