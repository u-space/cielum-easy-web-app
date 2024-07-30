import Axios, { AxiosError } from 'axios';
import jwtDecode from 'jwt-decode';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import env from '../../../vendor/environment/env';

export enum AuthRole {
	ADMIN = 'ADMIN',
	MONITOR = 'MONITOR',
	PILOT = 'PILOT',
	COA = 'COA',
	REMOTE_SENSOR = 'REMOTE_SENSOR',
	AIR_TRAFIC = 'AIR_TRAFIC',
	NOT_LOGGED_IN = 'NOT_LOGGED_IN'
}

interface AuthState {
	// User data
	token: string | null;
	username: string;
	email: string;
	role: AuthRole;
	// Progress state
	hasTriedToRelogin: boolean;
	// Actions
	login: (
		username: string,
		password: string,
		onSuccess?: () => void,
		onError?: (error: string) => void
	) => void;
	relogin: () => Promise<void>;
	logout: () => Promise<void>;
	reset: (
		email: string,
		onSuccess: () => void,
		onError: (error: string) => void
	) => Promise<void>;
}

const axios = Axios.create({
	baseURL: env.core_api,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json'
	}
});

function getAuthStateFromToken(token: string) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const decoded: any = jwtDecode(token);
	return {
		token,
		username: decoded.username,
		email: decoded.email,
		role: decoded.role
	};
}

export const useAuthStore = create<AuthState>()(
	devtools(
		(set) => ({
			token: null,
			username: '',
			email: '',
			role: AuthRole.NOT_LOGGED_IN,
			hasTriedToRelogin: false,
			login: async (username, password, onSuccess, onError) => {
				try {
					const body = JSON.stringify({ username, password, format: 'json' });
					const response = await axios.post('/auth/login', body, {
						withCredentials: true
					});
					set(getAuthStateFromToken(response.data.token));
					if (onSuccess) onSuccess();
				} catch (error) {
					if (error instanceof AxiosError) {
						if (onError) onError(error.response?.data?.message || error.message);
					} else {
						throw error;
					}
				}
			},
			relogin: async () => {
				try {
					const body = JSON.stringify({ format: 'json' });
					const response = await axios.post('/auth/relogin', body, {
						withCredentials: true
					});
					if (response.data !== 'User has sent no token or user' && response.data.token) {
						set(getAuthStateFromToken(response.data.token));
					} else {
						set({ hasTriedToRelogin: true });
					}
				} catch (error) {
					if (error instanceof AxiosError) {
						set({ hasTriedToRelogin: true });
					} else {
						throw error;
					}
				}
			},
			logout: async () => {
				await axios.post('/auth/clear', {}, { withCredentials: true });
				set({ token: '', username: '', email: '', role: AuthRole.NOT_LOGGED_IN });
			},
			reset: async (
				email: string,
				onSuccess: () => void,
				onError: (error: string) => void
			) => {
				try {
					const body = JSON.stringify({
						email: email,
						mobileClient: false,
						format: 'json'
					});
					const response = await axios.post('/auth/forgot-password', body, {
						withCredentials: false
					});
					if (onSuccess) onSuccess();
				} catch (error) {
					if (error instanceof AxiosError) {
						if (onError) onError(error.response?.data?.message || error.message);
					} else {
						throw error;
					}
				}
			}
		}),
		{ name: 'AuthStore' }
	)
);

export const useAuthIsAdmin = () => {
	const role = useAuthStore((state) => state.role);
	return role === AuthRole.ADMIN;
};

export const useAuthIsPilot = () => {
	const role = useAuthStore((state) => state.role);
	return role === AuthRole.PILOT;
};

export const useAuthGetRole = () => {
	return useAuthStore((state) => state.role);
};
