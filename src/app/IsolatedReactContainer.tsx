import { CoreAPIContext, FlightRequestAPIContext } from './utils';
import { getUTMClient } from '@utm-entities/client';
import env from '../vendor/environment/env';
import { getFlightRequestServiceAPIClient } from '@flight-request-entities/client';
import { ReactNode, Suspense } from 'react';
import { Spinner, SpinnerSize } from '@blueprintjs/core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useAuthStore } from './modules/auth/store';
import { useSchemaStore } from './modules/schemas/store';
import { shallow } from 'zustand/shallow';

const IsolatedReactContainer = (props: { children: ReactNode }) => {
	const queryClient = new QueryClient();
	const token = useAuthStore((state) => state.token);
	const schemas = useSchemaStore(
		(state) => ({ vehicles: state.vehicles, users: state.users, documents: state.documents }),
		shallow
	);
	return (
		<QueryClientProvider client={queryClient}>
			<CoreAPIContext.Provider value={getUTMClient(env.core_api, schemas, token)}>
				<FlightRequestAPIContext.Provider
					value={getFlightRequestServiceAPIClient(env.flight_request_api || '', token)}
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
						{props.children}
					</Suspense>
				</FlightRequestAPIContext.Provider>
			</CoreAPIContext.Provider>
		</QueryClientProvider>
	);
};

export default IsolatedReactContainer;
