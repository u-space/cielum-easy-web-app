import './app.scss';

import { BrowserRouter as Router } from 'react-router-dom';
import { AuthRole, useAuthStore } from './modules/auth/store';
import { Spinner, SpinnerSize } from '@blueprintjs/core';
import { Suspense, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { getUTMClient } from '@utm-entities/client';
import env from '../vendor/environment/env';
import { CoreAPIContext, FlightRequestAPIContext } from './utils';
import { useSchemaStore } from './modules/schemas/store';
import { shallow } from 'zustand/shallow';
import DeadScreen from './modules/auth/screens/DeadScreen';
import { getFlightRequestServiceAPIClient } from '@flight-request-entities/client';
import LoggedInScreens from './LoggedInScreens';
import NotLoggedInScreens from './NotLoggedInScreens';

export function App() {
	const role = useAuthStore((state) => state.role);
	const token = useAuthStore((state) => state.token);

	const [unrecoverableBackendError, setUnrecoverableBackendError] = useState<string | undefined>(
		env.maintenance_mode?.description
	);

	const queryClient = new QueryClient();
	const schemas = useSchemaStore(
		(state) => ({ vehicles: state.vehicles, users: state.users, documents: state.documents }),
		shallow
	);
	const fetchSchemas = useSchemaStore((state) => state.fetch);
	const relogin = useAuthStore((state) => state.relogin);

	useEffect(() => {
		// TODO: Re-fetch schemas when appropiate
		fetchSchemas()
			.then()
			.catch((err) => setUnrecoverableBackendError(err.message));
	}, [fetchSchemas]);

	useEffect(() => {
		relogin()
			.then()
			.catch((err) => setUnrecoverableBackendError(err.message));
	}, [relogin]);

	// TODO: Make this nicer

	if (unrecoverableBackendError) {
		return (
			<div className="app">
				<DeadScreen text={unrecoverableBackendError} />
			</div>
		);
	} else {
		return (
			<QueryClientProvider client={queryClient}>
				<CoreAPIContext.Provider value={getUTMClient(env.core_api, schemas, token)}>
					<FlightRequestAPIContext.Provider
						value={getFlightRequestServiceAPIClient(
							env.flight_request_api || '',
							token
						)}
					>
						<Suspense
							fallback={
								<div
									style={{
										height: '100vh',
										width: '100vw',
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<Spinner size={SpinnerSize.LARGE} />
								</div>
							}
						>
							<div className="app">
								<Router>
									{role === AuthRole.NOT_LOGGED_IN && <NotLoggedInScreens />}
									{role !== AuthRole.NOT_LOGGED_IN && <LoggedInScreens />}
								</Router>
							</div>
						</Suspense>
					</FlightRequestAPIContext.Provider>
				</CoreAPIContext.Provider>
			</QueryClientProvider>
		);
	}
}

export default App;
