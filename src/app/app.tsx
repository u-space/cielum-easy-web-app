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
import ReactMarkdown from 'react-markdown';
import classnames from 'classnames';
import PButton, { PButtonSize, PButtonType } from '@pcomponents/PButton';

export function App() {
	const role = useAuthStore((state) => state.role);
	const token = useAuthStore((state) => state.token);

	const [unrecoverableBackendError, setUnrecoverableBackendError] = useState<string | undefined>(
		env.maintenance_mode?.description
	);
	const [isBannerHidden, setBannerHiddenFlag] = useState<boolean>(
		localStorage.getItem('bannerHidden') === 'true'
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

	// Saves the banner hidden state in local storage
	useEffect(() => {
		localStorage.setItem('bannerHidden', isBannerHidden.toString());
	}, [isBannerHidden]);

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
								{env.tenant.extras?.banner && !isBannerHidden && (
									<div
										className={classnames(
											'banner',
											env.tenant.extras.banner.placement
										)}
									>
										<ReactMarkdown>
											{env.tenant.extras?.banner.md}
										</ReactMarkdown>
										<PButton
											icon={'cross'}
											onClick={() => setBannerHiddenFlag(true)}
											size={PButtonSize.SMALL}
											variant={PButtonType.DANGER}
										/>
									</div>
								)}
							</div>
						</Suspense>
					</FlightRequestAPIContext.Provider>
				</CoreAPIContext.Provider>
			</QueryClientProvider>
		);
	}
}

export default App;
