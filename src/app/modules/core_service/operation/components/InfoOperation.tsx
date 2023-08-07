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

import { ExtraFieldSchema } from '@utm-entities/extraFields';
import CardGroup from '../../../../commons/layouts/dashboard/menu/CardGroup';
import env from '../../../../../vendor/environment/env';
import { VehicleEntity } from '@utm-entities/vehicle';
import PUserSelectForAdmins from '@pcomponents/PUserSelectForAdmins';
import { UserEntity } from '@utm-entities/user';
import { useAuthIsAdmin, useAuthIsPilot, useAuthStore } from '../../../auth/store';
import { Operation } from '@utm-entities/v2/model/operation';
import { NestedUser } from '@utm-entities/v2/model/user';
import { OperationState } from '@utm-entities/operation';

interface OperationInfoProps {
	prop: string;
	entity: Operation;
	setInfo: (prop: keyof Operation, value: Operation[keyof Operation]) => void;
}

const OperationInfo: FC<OperationInfoProps> = observer(({ prop, entity, setInfo }) => {
	const { t } = useTranslation('glossary');
	if (prop === 'submit_time' || prop === 'update_time' || prop === 'owner' || prop === 'creator')
		return null;
	if (prop === 'flight_comments') {
		return (
			<PTextArea
				style={{ width: '100%' }}
				key={prop}
				id={`editor-operation-${prop}`}
				defaultValue={entity[prop]}
				label={t(`glossary:operation.${prop}`)}
				onChange={(value) => setInfo(prop as keyof Operation, value)}
			/>
		);
	}
	const value = entity[prop as keyof Operation];
	if (typeof value === 'string') {
		return (
			<PInput
				key={prop}
				id={`editor-operation-${prop}`}
				defaultValue={value}
				label={t(`glossary:operation.${prop}`)}
				onChange={(value) => setInfo(prop as keyof Operation, value)}
				isRequired
			/>
		);
	} else if (typeof value === 'object' && value instanceof Date) {
		return (
			<PDateInput
				key={prop}
				id={`editor-volume-${prop}`}
				defaultValue={value}
				label={t(`volume.${prop}`)}
				onChange={(value) => setInfo(prop as keyof Operation, value)}
				isRequired
				isTime
			/>
		);
	} else {
		return null;
	}
});

interface InfoOperationProps {
	operation: Operation;
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
		operation.contact = '';
		operation.contact_phone = '';
		// TODO: operation.uas_registrations = [];
		if (_value.length > 0) {
			const value = _value[0];

			operation.owner = new NestedUser(value);

			if (value.fullName) operation.contact = value.fullName;
			if (value.extra_fields?.phone) {
				operation.contact_phone = String(value.extra_fields.phone);
			} else {
				operation.contact_phone = t('The user has no known phone');
			}
		} else {
			operation.owner = null;
		}
	};

	if (!token) return null;
	return (
		<>
			<CardGroup header="Creating an operation">
				{/*isAdmin && (
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
				)*/}
				{/*
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
				/>*/}
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
						setInfo={(prop: keyof Operation, value: Operation[keyof Operation]) =>
							operation.set(prop, value)
						}
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
