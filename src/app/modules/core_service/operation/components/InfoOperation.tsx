import PVehicleSelect from '@pcomponents/PVehicleSelect';
import POperationStateSelect from '@pcomponents/POperationStateSelect';
import PInput from '@pcomponents/PInput';
import PButton, { PButtonProps } from '@pcomponents/PButton';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import PDateInput from '@pcomponents/PDateInput';
import PBooleanInput from '@pcomponents/PBooleanInput';
import PTextArea from '@pcomponents/PTextArea';
import { FC } from 'react';
import { OperationEntity, OperationState } from '@utm-entities/operation';
import { ExtraFieldSchema } from '@utm-entities/extraFields';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import env from '../../../../../vendor/environment/env';
import { VehicleEntity } from '@utm-entities/vehicle';
import PUserSelectForAdmins from '@pcomponents/PUserSelectForAdmins';
import PUserSelectForPilots from '@pcomponents/PUserSelectForPilots';
import { UserEntity } from '@utm-entities/user';
import { useAuthIsAdmin, useAuthIsPilot, useAuthStore } from '../../../auth/store';

interface OperationInfoProps {
	prop: keyof OperationEntity;
	entity: OperationEntity;
	setInfo: (prop: keyof OperationEntity, value: OperationEntity[keyof OperationEntity]) => void;
}

const OperationInfo: FC<OperationInfoProps> = observer(({ prop, entity, setInfo }) => {
	const { t } = useTranslation('glossary');
	if (
		prop === 'airspace_authorization' ||
		prop === 'submit_time' ||
		prop === 'update_time' ||
		prop === 'aircraft_comments' ||
		prop === 'volumes_description' ||
		prop === 'owner' ||
		prop === 'creator' ||
		prop === 'faa_rule'
	)
		return null;
	if (prop === 'flight_comments') {
		return (
			<PTextArea
				style={{ width: '100%' }}
				key={prop}
				id={`editor-operation-${prop}`}
				defaultValue={entity[prop]}
				label={t(`glossary:operation.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
			/>
		);
	}
	if (typeof entity[prop] === 'string') {
		return (
			<PInput
				key={prop}
				id={`editor-operation-${prop}`}
				defaultValue={entity[prop]}
				label={t(`glossary:operation.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				disabled={prop === 'message_id'}
			/>
		);
	} else if (typeof entity[prop] === 'object' && entity[prop] instanceof Date) {
		return (
			<PDateInput
				key={prop}
				id={`editor-volume-${prop}`}
				defaultValue={entity[prop]}
				label={t(`volume.${prop}`)}
				onChange={(value) => setInfo(prop, value)}
				isRequired
				isTime
			/>
		);
	} else if (typeof entity[prop] === 'boolean') {
		return (
			<PBooleanInput
				key={prop}
				id={`editor-volume-${prop}`}
				defaultValue={entity[prop]}
				label={t(`volume.${prop}`)}
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

interface InfoOperationProps {
	operation: OperationEntity;
	schemaUsers: ExtraFieldSchema;
	schemaVehicles: ExtraFieldSchema;
	isEditingExisting: boolean;
	props: string[];
	save: PButtonProps['onClick'];
}

const InfoOperation: FC<InfoOperationProps> = ({
	operation,
	schemaUsers,
	schemaVehicles,
	isEditingExisting,
	props,
	save
}) => {
	const { t } = useTranslation(['ui', 'glossary']);
	const isAdmin = useAuthIsAdmin();
	const isPilot = useAuthIsPilot();
	const token = useAuthStore((state) => state.token);
	const onSelectUser = (_value: UserEntity[]) => {
		operation.set('contact', '');
		operation.set('contact_phone', '');
		operation.set('uas_registrations', []);
		if (_value.length > 0) {
			const value = _value[0];

			operation.set('owner', value);

			if (value.fullName) operation.set('contact', value.fullName);
			if (value.extra_fields?.phone) {
				operation.set('contact_phone', value.extra_fields.phone);
			} else {
				operation.set('contact_phone', t('The user has no known phone'));
			}
		} else {
			operation.set('owner', null);
		}
	};

	return (
		<>
			<CardGroup header="Creating an operation">
				{isAdmin && (
					<PUserSelectForAdmins
						label={t('glossary:operation.owner')}
						onSelect={onSelectUser}
						preselected={operation.owner ? [operation.owner] : []}
						fill
						isRequired
						disabled={isPilot}
						token={token}
						isAdmin={isAdmin}
						isPilot={isPilot}
						schema={schemaUsers}
						api={env.core_api}
						id={'user-select-admins'}
					/>
				)}
				<PVehicleSelect
					api={env.core_api}
					label={t('glossary:operation.uas_registrations')}
					onSelect={(value: VehicleEntity[]) => operation.set('uas_registrations', value)}
					preselected={operation.uas_registrations}
					username={operation.owner?.username}
					fill
					isRequired
					token={token}
					schema={schemaVehicles}
				/>
				{isAdmin && isEditingExisting && (
					<POperationStateSelect
						id="editor-state"
						label={t('glossary:operation.state')}
						defaultValue={operation.state}
						onChange={(value: OperationState) => operation.set('state', value)}
						inline={undefined}
						fill={undefined}
						isDarkVariant={undefined}
					/>
				)}
				{props.map((prop) => (
					<OperationInfo
						key={'0' + prop}
						entity={operation}
						prop={prop}
						setInfo={(
							prop: keyof OperationEntity,
							value: OperationEntity[keyof OperationEntity]
						) => operation.set(prop, value)}
					/>
				))}
			</CardGroup>
			<PButton onClick={save}>
				{isEditingExisting ? t('Save the operation') : t('Create the operation')}
			</PButton>
		</>
	);
};

export default observer(InfoOperation);
