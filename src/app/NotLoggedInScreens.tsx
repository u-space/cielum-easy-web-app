import { Route, Switch } from 'react-router-dom';
import VerificationScreen from './modules/auth/screens/VerificationScreen';
import PasswordResetScreen from './modules/auth/screens/PasswordResetScreen';
import RegisterScreen from './modules/auth/screens/RegisterScreen';
import LoginScreen from './modules/auth/screens/LoginScreen';

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
			<Route path="/">
				<LoginScreen />
			</Route>
		</Switch>
	);
};

export default NotLoggedInScreens;
