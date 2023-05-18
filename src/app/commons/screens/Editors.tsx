import { Icon } from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styles from './EditorHub.module.scss';
import DashboardLayout from '../layouts/DashboardLayout';
import env from '../../../vendor/environment/env';
import { useAuthIsAdmin, useAuthIsPilot } from '../../modules/auth/store';
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esnext/generated-icons/16px/blueprint-icons-16';
import { useAuthStore } from '../../modules/auth/store';
import { Role } from '../../../vendor/environment/_types';
import { getFeatureOption } from '../../utils';

const UserFeatureSetEditors = () => {
	const { t } = useTranslation();
	const history = useHistory();
	const isAdmin = useAuthIsAdmin();

	if (isAdmin) {
		return (
			<div className={styles.item} onClick={() => history.push('/editor/user')}>
				<div>
					<Icon icon="person" size={64} />
				</div>
				<div>{t('User')}</div>
			</div>
		);
	} else {
		return null;
	}
};

const VehicleFeatureSetEditors = () => {
	const { t } = useTranslation();
	const history = useHistory();

	return (
		<div className={styles.item} onClick={() => history.push('/editor/vehicle')}>
			<div>
				<Icon icon="airplane" size={64} />
			</div>
			<div>{t('Vehicle')}</div>
		</div>
	);
};

const RegularFlightFeatureSetEditors = () => {
	const { t } = useTranslation();
	const history = useHistory();
	const isAdmin = useAuthIsAdmin();
	if (isAdmin) {
		return (
			<div className={styles.item} onClick={() => history.push('/editor/regularflight')}>
				<div>
					<Icon icon="route" size={64} />
				</div>
				<div>{t('Regular Flight')}</div>
			</div>
		);
	} else {
		return null;
	}
};

const RfvFeatureSetEditors = () => {
	const { t } = useTranslation();
	const history = useHistory();
	const isAdmin = useAuthIsAdmin();

	if (isAdmin) {
		return (
			<div className={styles.item} onClick={() => history.push('/editor/rfv')}>
				<div>
					<Icon icon="polygon-filter" size={64} />
				</div>
				<div>{t('RFV')}</div>
			</div>
		);
	} else {
		return null;
	}
};

const UvrFeatureSetEditors = () => {
	const { t } = useTranslation();
	const history = useHistory();
	const isAdmin = useAuthIsAdmin();
	if (isAdmin) {
		return (
			<div className={styles.item} onClick={() => history.push('/editor/uvr')}>
				<div>
					<Icon icon="graph-remove" size={64} />
				</div>
				<div>{t('UVR')}</div>
			</div>
		);
	} else {
		return null;
	}
};

const TrackerFeatureSetEditors = () => {
	const { t } = useTranslation();
	const history = useHistory();
	return (
		<div className={styles.item} onClick={() => history.push('/editor/tracker')}>
			<div>
				<Icon icon="circle" size={64} />
			</div>
			<div>{t('Tracker')}</div>
		</div>
	);
};
const OperationFeatureSetEditors = () => {
	const { t } = useTranslation();
	const history = useHistory();
	const isAdmin = useAuthIsAdmin();
	const isPilot = useAuthIsPilot();

	if (isAdmin || (isPilot && getFeatureOption('Operations', 'pilotCanCreateOperations'))) {
		return (
			<div className={styles.item} onClick={() => history.push('/editor/operation')}>
				<div>
					<Icon icon="area-of-interest" size={64} />
				</div>
				<div>{t('Operation')}</div>
			</div>
		);
	} else {
		return null;
	}
};

const FlightRequestFeatureSetEditors = () => {
	const { t } = useTranslation();
	const history = useHistory();
	const isAdmin = useAuthIsAdmin();
	return (
		<>
			<div className={styles.item} onClick={() => history.push('/editor/flightrequest')}>
				<div>
					<Icon icon="document-open" size={64} />
				</div>
				<div>{t('flightRequest')}</div>
			</div>
			{isAdmin && (
				<div className={styles.item} onClick={() => history.push('/editor/coordinator')}>
					<div>
						<Icon icon="graph" size={64} />
					</div>
					<div>{t('Coordinator')}</div>
				</div>
			)}
		</>
	);
};

const ExtraTenantButtons = () => {
	const { t } = useTranslation();
	const history = useHistory();
	const role = useAuthStore((state) => state.role);

	if (env.tenant.extras?.editor_hub_buttons) {
		return (
			<>
				{env.tenant.extras.editor_hub_buttons.map((button, index) => {
					if (button.roles.includes(role as Role)) {
						return (
							<div
								className={styles.item}
								onClick={() => history.push(button.url)}
								key={index}
							>
								<div>
									<Icon icon={button.icon as BlueprintIcons_16Id} size={64} />
								</div>
								<div>{t(button.label)}</div>
							</div>
						);
					} else {
						return null;
					}
				})}
			</>
		);
	} else {
		return null;
	}
};

const Editors = () => {
	const { t } = useTranslation();
	return (
		<DashboardLayout isLoading={false}>
			<div className={styles.horizontal_usecases}>
				<div className={styles.title}>{t('Select the entity to create')}</div>
				<UserFeatureSetEditors />
				{env.tenant.features.Operations.enabled && <OperationFeatureSetEditors />}
				{env.tenant.features.Vehicles.enabled && <VehicleFeatureSetEditors />}
				{env.tenant.features.RegularFlights.enabled && <RegularFlightFeatureSetEditors />}
				{env.tenant.features.Rfvs.enabled && <RfvFeatureSetEditors />}
				{env.tenant.features.Uvrs.enabled && <UvrFeatureSetEditors />}
				{env.tenant.features.FlightRequests.enabled && <FlightRequestFeatureSetEditors />}
				{env.tenant.features.Trackers.enabled && <TrackerFeatureSetEditors />}
				<ExtraTenantButtons />
			</div>
		</DashboardLayout>
	);
};

export default Editors;
