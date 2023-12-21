import './app.scss';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthRole, useAuthStore } from './modules/auth/store';
import { Spinner, SpinnerSize } from '@blueprintjs/core';
import { Suspense, useEffect, useRef, useState } from 'react';
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
import 'iconify-icon';
import io, { Socket } from 'socket.io-client';
import { usePositionStore } from './modules/core_service/position/store';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ScreenToSmall = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100dvh;
	width: 100dvw;
	font-size: 2rem;
	color: var(--white-100);
	text-align: center;
`;

const SECONDS_BEFORE_REDIRECT = 5;
export function App() {
	const { t } = useTranslation();
	const role = useAuthStore((state) => state.role);
	const token = useAuthStore((state) => state.token);

	const [unrecoverableBackendError, setUnrecoverableBackendError] = useState<string | undefined>(
		env.maintenance_mode?.description
	);
	const [isBannerHidden, setBannerHiddenFlag] = useState<boolean>(
		localStorage.getItem('bannerHidden') === 'true'
	);
	const [screenToSmall, setScreenToSmall] = useState<boolean>(false);
	const [secondsLeftBeforeRedirect, setSecondsLeftBeforeRedirect] =
		useState<number>(SECONDS_BEFORE_REDIRECT);

	const queryClient = new QueryClient();
	const schemas = useSchemaStore(
		(state) => ({ vehicles: state.vehicles, users: state.users, documents: state.documents }),
		shallow
	);
	const fetchSchemas = useSchemaStore((state) => state.fetch);
	const relogin = useAuthStore((state) => state.relogin);
	const addPosition = usePositionStore((state) => state.addPosition);

	// TODO: Improve this, as it is copied verbatim
	const socket = useRef<typeof Socket>(null);

	useEffect(() => {
		// Re-connect to socket io on token change

		if (socket.current) socket.current.disconnect();
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		socket.current = io(env.core_api + '/private?token=' + token);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		socket.current.on('new-position', function (info: any) {
			addPosition(info);
		});

		socket.current.connect();
		return () => {
			if (socket.current) socket.current.disconnect();
		};
	}, [queryClient, token]);

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

	// Add script to the document, if extra tenant config is set
	useEffect(() => {
		if (!env.tenant.extras.external_client_tracking_script) return;
		const { element, id, src } = env.tenant.extras.external_client_tracking_script;
		const script = document.createElement('script');
		script.src = src;
		script.id = id;
		script.defer = true;
		script.async = true;
		script.type = 'text/javascript';
		document.querySelector(element)?.appendChild(script);
	}, []);

	useEffect(() => {
		if (!env.redirect_small_screens_url) return;
		if (window.screen.width <= 1000) {
			setScreenToSmall(true);
		}
		const onResize = () => {
			if (window.screen.width > 1000) {
				setScreenToSmall(false);
			} else {
				setScreenToSmall(true);
			}
		};
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, []);

	const interval = useRef<NodeJS.Timer | null>(null);

	useEffect(() => {
		if (screenToSmall) {
			interval.current = setInterval(() => {
				setSecondsLeftBeforeRedirect((current) => current - 1);
			}, 1000);
		} else {
			setSecondsLeftBeforeRedirect(SECONDS_BEFORE_REDIRECT);
		}
		return () => {
			if (interval.current) {
				clearInterval(interval.current);
				interval.current = null;
			}
		};
	}, [screenToSmall]);

	useEffect(() => {
		if (secondsLeftBeforeRedirect <= 0) {
			const path = window.location.href.slice(window.location.origin.length);
			window.location.href = env.redirect_small_screens_url + path || window.location.href;
		}
	}, [secondsLeftBeforeRedirect]);

	// TODO: Make this nicer

	if (screenToSmall) {
		return (
			<ScreenToSmall>
				<h1>{secondsLeftBeforeRedirect}</h1>
				{t('You will be redirected to the mobile version')}
			</ScreenToSmall>
		);
	} else if (unrecoverableBackendError) {
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
