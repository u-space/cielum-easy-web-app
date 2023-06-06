import { IconName } from '@blueprintjs/core';
import DashboardLayout from '../layouts/DashboardLayout';
import env from '../../../vendor/environment/env';
import { getFeatureOption } from '../../utils';
import QuickLaunchButtonsLayout, { QuickLaunchButton } from '../layouts/QuickLaunchButtonsLayout';
import { isFeatureEnabled } from '../../../utils';

function getUserFeatureSetEditorsButtons(): QuickLaunchButton[] {
	return [{ label: 'User', icon: 'person', path: '/editor/user', isAdmin: true }];
}

function getVehicleFeatureSetEditorsButtons(): QuickLaunchButton[] {
	if (isFeatureEnabled('Vehicles')) {
		return [{ label: 'Vehicle', icon: 'airplane', path: '/editor/vehicle', isAdmin: true }];
	} else {
		return [];
	}
}

function getRegularFlightFeatureSetEditorsButtons(): QuickLaunchButton[] {
	if (isFeatureEnabled('RegularFlights')) {
		return [
			{ label: 'Regular Flight', icon: 'route', path: '/editor/regularflight', isAdmin: true }
		];
	} else {
		return [];
	}
}

function getRfvFeatureSetEditorsButtons(): QuickLaunchButton[] {
	if (isFeatureEnabled('Rfvs')) {
		return [{ label: 'RFV', icon: 'polygon-filter', path: '/editor/rfv', isAdmin: true }];
	} else {
		return [];
	}
}

function getUvrFeatureSetEditorsButtons(): QuickLaunchButton[] {
	if (isFeatureEnabled('Uvrs')) {
		return [{ label: 'UVR', icon: 'graph-remove', path: '/editor/uvr', isAdmin: true }];
	} else {
		return [];
	}
}

function getTrackerFeatureSetEditorsButtons(): QuickLaunchButton[] {
	if (isFeatureEnabled('Trackers')) {
		return [{ label: 'Tracker', icon: 'circle', path: '/editor/tracker', isAdmin: false }];
	} else {
		return [];
	}
}

function getOperationFeatureSetEditorsButtons(): QuickLaunchButton[] {
	if (isFeatureEnabled('Operations')) {
		return [
			{
				label: 'Operation',
				icon: 'area-of-interest',
				path: '/editor/operation',
				isAdmin: !getFeatureOption('Operations', 'pilotCanCreateOperations')
			}
		];
	} else {
		return [];
	}
}

function getFlightRequestFeatureSetEditorsButtons(): QuickLaunchButton[] {
	if (isFeatureEnabled('FlightRequests')) {
		return [
			{
				label: 'Flight Request',
				icon: 'document-open',
				path: '/editor/flightrequest',
				isAdmin: false
			},
			{ label: 'Coordinator', icon: 'graph', path: '/editor/coordinator', isAdmin: true }
		];
	} else {
		return [];
	}
}

function getExtraTenantButtons(): QuickLaunchButton[] {
	if (env.tenant.extras?.editor_hub_buttons) {
		return env.tenant.extras.editor_hub_buttons.map((button) => {
			return {
				label: button.label,
				icon: button.icon as IconName,
				path: button.url,
				isAdmin: button.roles.includes('ADMIN')
			};
		});
	} else {
		return [];
	}
}

const Editors = () => {
	return (
		<DashboardLayout isLoading={false}>
			<QuickLaunchButtonsLayout
				title={'Select the entity to create'}
				buttons={[
					...getUserFeatureSetEditorsButtons(),
					...getVehicleFeatureSetEditorsButtons(),
					...getOperationFeatureSetEditorsButtons(),
					...getRegularFlightFeatureSetEditorsButtons(),
					...getRfvFeatureSetEditorsButtons(),
					...getUvrFeatureSetEditorsButtons(),
					...getFlightRequestFeatureSetEditorsButtons(),
					...getTrackerFeatureSetEditorsButtons(),
					...getExtraTenantButtons()
				]}
			/>
		</DashboardLayout>
	);
};

export default Editors;
