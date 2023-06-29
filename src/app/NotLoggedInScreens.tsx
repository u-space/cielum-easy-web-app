import { Route, Switch } from 'react-router-dom';
import VerificationScreen from './modules/auth/screens/VerificationScreen';
import PasswordResetScreen from './modules/auth/screens/PasswordResetScreen';
import RegisterScreen from './modules/auth/screens/RegisterScreen';
import LoginScreen from './modules/auth/screens/LoginScreen';
import PublicMapTemporalDemo from './modules/map/screens/live/PublicMapTemporalDemo';
import { useAuthStore } from './modules/auth/store';
import { useEffect } from 'react';
import { Spinner } from '@blueprintjs/core';
import env from '../vendor/environment/env';

const TemporalAutoLogin = () => {
	/* Demo code */
	const login = useAuthStore((state) => state.login);
	useEffect(() => {
		login(env.user, env.password);
	}, []);
	return <Spinner size={36} />;
};

const NotLoggedInScreens = () => {
	return (
		<Switch>
			<Route exact path="/verify/:username">
				<VerificationScreen />
			</Route>
			<Route exact path="/password-reset/:username">
				<PasswordResetScreen />
			</Route>
			<Route exact path="/register">
				<RegisterScreen />
			</Route>
			<Route exact path="/public/map">
				<TemporalAutoLogin />
			</Route>
			<Route path="/">
				<LoginScreen />
			</Route>
		</Switch>
	);
};

export default NotLoggedInScreens;
