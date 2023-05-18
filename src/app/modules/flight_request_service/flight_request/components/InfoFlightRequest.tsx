import PButton from '@pcomponents/PButton';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import PBooleanInput from '@pcomponents/PBooleanInput';
import PTextArea from '@pcomponents/PTextArea';
import { FC, useEffect, useState } from 'react';
import PDropdown from '@pcomponents/PDropdown';
import { FlightCategory, FlightRequestEntity } from '@flight-request-entities/flightRequest';
import { ExtraFieldSchema } from '@utm-entities/extraFields';
import { useAuthIsAdmin, useAuthIsPilot, useAuthStore } from '../../../auth/store';
import PUserSelectForAdmins from '@pcomponents/PUserSelectForAdmins';
import PUserSelectForPilots from '@pcomponents/PUserSelectForPilots';
import { UserEntity } from '@utm-entities/user';
import env from '../../../../../vendor/environment/env';
import PInput from '@pcomponents/PInput';
import PVehicleSelect from '@pcomponents/PVehicleSelect';
import { VehicleEntity } from '@utm-entities/vehicle';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import { useSchemaStore } from '../../../schemas/store';

interface FlightRequestInfoProps {
	prop: keyof FlightRequestEntity;
	entity: FlightRequestEntity;
	setInfo: (
		prop: keyof FlightRequestEntity,
		value: Exclude<FlightRequestEntity[keyof FlightRequestEntity], undefined>
	) => void;
}

const FlightRequestInfo: FC<FlightRequestInfoProps> = observer(({ prop, entity, setInfo }) => {
	const { t } = useTranslation('glossary');
	if (prop === 'creator') return null;
	const value = entity[prop];
	if (prop === 'flight_comments') {
		return (
			<PTextArea
				style={{ width: '100%' }}
				key={prop}
				id={`editor-flightRequest-${prop}`}
				defaultValue={entity[prop]}
				label={t(`glossary:flightRequest.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
			/>
		);
	}
	if (prop === 'flight_category') {
		return (
			<PDropdown
				key={prop}
				options={Object.values(FlightCategory).map((value) => ({
					value: value,
					label: t(`glossary:flightRequest.flight_category.${value}`)
				}))}
				id={`editor-flightRequest-${prop}`}
				defaultValue={entity[prop]}
				label={t(`glossary:flightRequest.flightCategory`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
			/>
		);
	}
	if (typeof value === 'string') {
		return (
			<PInput
				key={prop}
				id={`editor-flightRequest-${prop}`}
				defaultValue={value}
				label={t(`glossary:flightRequest.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				disabled={prop === 'id'}
			/>
		);
	} else if (typeof value === 'boolean') {
		return (
			<PBooleanInput
				key={prop}
				id={`editor-volume-${prop}`}
				defaultValue={value}
				label={t(`flightRequest.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				inline
				fill
			/>
		);
	} else {
		return null;
	}
});

interface InfoFlightRequestProps {
	flightRequest: FlightRequestEntity;
	isEditingExisting: boolean;
	volumeProps: string[];
	nextStep: () => void;
}

const InfoFlightRequest: FC<InfoFlightRequestProps> = ({
	flightRequest,
	isEditingExisting,
	volumeProps,
	nextStep
}) => {
	const { t } = useTranslation(['ui', 'glossary']);
	const isPilot = useAuthIsPilot();
	const isAdmin = useAuthIsAdmin();
	const username = useAuthStore((state) => state.username);
	const schemaUsers = useSchemaStore((state) => state.users);
	const schemaVehicles = useSchemaStore((state) => state.vehicles);
	const token = useAuthStore((state) => state.token);
	const onSelectUserForAdmins = (_value: UserEntity[]) => {
		flightRequest.setUavs([]);
		if (_value.length > 0) {
			const value = _value[0];
			flightRequest.setOperator(value);
		} else {
			flightRequest.setOperator(null);
		}
	};
	const onSelectUserForPilots = (value: string[]) => {
		flightRequest.setUavs([]);
		if (value.length > 0) {
			flightRequest.setOperator(value[0]);
		} else {
			flightRequest.setOperator(null);
		}
	};

	const [isDefaultOperator, setDefaultOperatorFlag] = useState<boolean>(true);

	return (
		<>
			<CardGroup header="Creating a Flight Request">
				<PBooleanInput
					id={`editor-volume-isDefaultOperator`}
					defaultValue={isDefaultOperator}
					label={t('glossary:flightRequest.isDefaultOperator')}
					onChange={(value: boolean) => {
						setDefaultOperatorFlag(value);
						flightRequest.setOperator(
							value && env.tenant.features.FlightRequests.enabled
								? env.tenant.features.FlightRequests.options.defaultOperatorUsername
								: null
						);
					}}
					isRequired
					inline
					fill
				/>
				{!isDefaultOperator && isAdmin && (
					<PUserSelectForAdmins
						api={env.core_api}
						label={t('glossary:flightRequest.operator')}
						onSelect={onSelectUserForAdmins}
						preselected={
							flightRequest.operator ? [flightRequest.operator as UserEntity] : []
						}
						fill
						isRequired
						disabled={isPilot}
						token={token}
						schema={schemaUsers}
						id={'editor-select-user-pilot'}
					/>
				)}
				{!isDefaultOperator && isPilot && (
					<PUserSelectForPilots
						label={t('glossary:flightRequest.operator')}
						onSelect={onSelectUserForPilots}
						id={'editor-select-user-admin'}
					/>
				)}
				<PVehicleSelect
					label={t('glossary:flightRequest.uas_registrations')}
					onSelect={(value: VehicleEntity[]) => flightRequest.setUavs(value)}
					preselected={flightRequest.uavs}
					username={
						isAdmin ? (flightRequest?.operator as UserEntity)?.username : username
					}
					fill
					isRequired
					token={token}
					schema={schemaVehicles}
					api={env.core_api}
				/>
				<FlightRequestInfo
					key={'flight_comments'}
					prop={'flight_comments'}
					entity={flightRequest}
					setInfo={(prop, value) => flightRequest.setFlightComments(value as string)}
				/>
				<FlightRequestInfo
					key={'urban_flight'}
					prop={'urban_flight'}
					entity={flightRequest}
					setInfo={(prop, value) => flightRequest.setUrbanFlight(value as boolean)}
				/>
				{flightRequest.urban_flight && (
					<FlightRequestInfo
						key={'parachute_model'}
						prop={'parachute_model'}
						entity={flightRequest}
						setInfo={(prop, value) => flightRequest.setParachuteModel(value as string)}
					/>
				)}
				<FlightRequestInfo
					key={'dji_blocked'}
					prop={'dji_blocked'}
					entity={flightRequest}
					setInfo={(prop, value) => flightRequest.setDjiBlocked(value as boolean)}
				/>
				{flightRequest.dji_blocked && (
					<>
						<FlightRequestInfo
							key={'dji_controller_number'}
							prop={'dji_controller_number'}
							entity={flightRequest}
							setInfo={(prop, value) =>
								flightRequest.setDjiControllerNumber(value as string)
							}
						/>
						<FlightRequestInfo
							key={'dji_email'}
							prop={'dji_email'}
							entity={flightRequest}
							setInfo={(prop, value) => flightRequest.setDjiEmail(value as string)}
						/>
					</>
				)}
				<FlightRequestInfo
					key={'flight_category'}
					prop={'flight_category'}
					entity={flightRequest}
					setInfo={(prop, value) =>
						flightRequest.setFlightCategory(value as FlightCategory)
					}
				/>
			</CardGroup>
			<PButton
				onClick={() => {
					nextStep();
				}}
			>
				{t('Continue')}
			</PButton>
		</>
	);
};

export default observer(InfoFlightRequest);
