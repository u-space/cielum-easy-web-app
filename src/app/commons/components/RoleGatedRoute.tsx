import { Component, FC, lazy, ReactElement } from 'react';
import _ from 'lodash';
import { useAuthStore } from '../../modules/auth/store';
import { Route } from 'react-router-dom';

interface MasterRouteProps {
	component_path?: string; // Will lazy load a component from the path
	children: ReactElement; // Will render a component (imported statically from the path)
	path: string; // Route path (url)
	exact?: boolean; // Exact match
	roles: string[]; // Roles that can access this route
}

function renderLazyComponent(path: string) {
	return lazy(() => import(`../../../${path}`));
}

const RoleGatedRoute: FC<MasterRouteProps> = ({ component_path, roles, path, exact, children }) => {
	const role = useAuthStore((state) => state.role);
	if (component_path) {
		const Component = renderLazyComponent(component_path);
		return <Component />;
	} else if (children) {
		if (_.includes(roles, role)) {
			return (
				<Route exact={exact} path={path}>
					{children}
				</Route>
			);
		} else {
			return (
				<Route exact={exact} path={path}>
					{/*<SimpleInfoScreen
						title={t('Forbidden')}
						icon="disable"
						content={t('You do not have permission to see this page')}
					/>*/}
					<p>No permission, fix me</p>
				</Route>
			);
		}
	} else {
		console.error('RoleGatedRoute: No component or component_path provided');
		return null;
	}
};

export default RoleGatedRoute;
