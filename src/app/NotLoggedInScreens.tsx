import { Route, Switch, useHistory } from 'react-router-dom';
import VerificationScreen from './modules/auth/screens/VerificationScreen';
import PasswordResetScreen from './modules/auth/screens/PasswordResetScreen';
import RegisterScreen from './modules/auth/screens/RegisterScreen';
import LoginScreen from './modules/auth/screens/LoginScreen';
import { reactify } from 'svelte-preprocess-react';
import LivePublicMapSvelte from './modules/map/screens/live/LivePublicMapV2App.svelte';
import PasswordResetRequest from './modules/auth/screens/PasswordResetRequest';

const LiveMap = reactify(LivePublicMapSvelte);

const NotLoggedInScreens = () => {
	const history = useHistory();
	return (
		<Switch>
			<Route exact path="/map">
				<LiveMap history={history} />
			</Route>
			<Route exact path="/verify/:username">
				<VerificationScreen />
			</Route>
			<Route exact path="/reset-password/request">
				<PasswordResetRequest />
			</Route>
			<Route exact path="/reset-password/">
				<PasswordResetScreen />
			</Route>
			<Route exact path="/register">
				<RegisterScreen />
			</Route>
			<Route path="/">
				<LoginScreen />
			</Route>
		</Switch>
	);
};

export default NotLoggedInScreens;
