import { observer } from 'mobx-react';
import { CSSProperties, FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PInput from '@pcomponents/PInput';
import PVehicleSelect from '@pcomponents/PVehicleSelect';
import styles from '../../../../commons/Pages.module.scss';
import { UseLocalStoreEntity } from '../../../../commons/utils';
import { TrackerEntity } from '@utm-entities/tracker';
import { useSchemaStore } from '../../../schemas/store';
import PUserSelectForAdmins from '@pcomponents/PUserSelectForAdmins';
import { useAuthIsAdmin, useAuthIsPilot, useAuthStore } from '../../../auth/store';
import env from '../../../../../vendor/environment/env';
import { UserEntity } from '@utm-entities/user';
import PUserSelectForPilots from '@pcomponents/PUserSelectForPilots';
import { VehicleEntity } from '@utm-entities/vehicle';

interface BaseTrackerDetailsProps {
	ls: UseLocalStoreEntity<TrackerEntity>;
	isEditing: boolean;
	isCreating: boolean;
}

const BaseTrackerDetails: FC<BaseTrackerDetailsProps> = observer(
	({ ls, isEditing, isCreating }) => {
		const schemaUsers = useSchemaStore((state) => state.users);
		const schemaVehicles = useSchemaStore((state) => state.vehicles);
		const isAdmin = useAuthIsAdmin();
		const isPilot = useAuthIsPilot();
		const username = useAuthStore((state) => state.username);
		const token = useAuthStore((state) => state.token);

		const { t } = useTranslation(['ui', 'glossary']);

		const [user, setUser] = useState<UserEntity | null>(null);

		const onSelectUser = (_value: UserEntity[]) => {
			if (_value.length > 0) {
				const value = _value[0];
				setUser(value);
			} else {
				setUser(null);
			}
		};

		if (ls.entity) {
			return (
				<>
					<PInput
						id={'hardwareId'}
						defaultValue={ls.entity.hardware_id}
						label={t('glossary:tracker.hardware_id')}
						explanation={t('glossary:tracker.hardware_id_desc')}
						onChange={(value) => (ls.entity.hardware_id = value)}
						isRequired
						isDarkVariant={true}
						disabled={!isCreating}
					/>
					{isEditing && !ls.entity.vehicle && isAdmin && (
						<PUserSelectForAdmins
							id="owner"
							label={t('glossary:operation.owner')}
							onSelect={onSelectUser}
							preselected={user ? [user] : []}
							fill
							isRequired
							disabled={!isEditing}
							isDarkVariant
							schema={schemaUsers}
							api={env.core_api}
							token={token}
						/>
					)}
					{user && isAdmin && (
						<PVehicleSelect
							api={env.core_api}
							label={t('Vehicle')}
							onSelect={(_value: VehicleEntity[]) => {
								if (_value.length > 0) {
									ls.entity.vehicle = _value[0];
								} else {
									ls.entity.vehicle = null;
								}
							}}
							preselected={ls.entity.vehicle ? [ls.entity.vehicle] : []}
							username={user.username}
							fill
							isRequired
							isDarkVariant
							single
							disabled={!isEditing}
							token={token}
							schema={schemaVehicles}
						/>
					)}
					{isPilot && (
						<PVehicleSelect
							api={env.core_api}
							label={t('Vehicle')}
							onSelect={(_value: VehicleEntity[]) => {
								if (_value.length > 0) {
									ls.entity.vehicle = _value[0];
								} else {
									ls.entity.vehicle = null;
								}
							}}
							preselected={ls.entity.vehicle ? [ls.entity.vehicle] : []}
							username={username}
							fill
							isRequired
							isDarkVariant
							single
							disabled={!isEditing}
							token={token}
							schema={schemaVehicles}
						/>
					)}
				</>
			);
		} else {
			return null;
		}
	}
);

interface ViewAndEditTrackerProps {
	ls: UseLocalStoreEntity<TrackerEntity>;
	isEditing: boolean;
	isCreating?: boolean;
	style?: CSSProperties;
}

const ViewAndEditTracker: FC<ViewAndEditTrackerProps> = ({
	ls,
	isEditing,
	isCreating = false,
	style
}) => {
	const { t } = useTranslation();
	return (
		<div className={styles.twobytwo} style={style}>
			<div className={styles.content}>
				<aside className={styles.summary}>
					<h2>{t('Tracker information')}</h2>
					{t(
						'Please find the attached serial number to the tracker and introduce it here, as it uniquely identifies the hardware'
					)}
				</aside>
				<section className={styles.details}>
					<BaseTrackerDetails isEditing={isEditing} isCreating={isCreating} ls={ls} />
				</section>
			</div>
		</div>
	);
};

export default observer(ViewAndEditTracker);
