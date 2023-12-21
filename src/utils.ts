import Axios, { AxiosError } from 'axios';
import env from './vendor/environment/env';
import { Tenant } from './vendor/environment/_types';

export const colors = {
	uncolorize: (str: string) => str.replace(/\x1B\[\d+m/gi, ''),
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m', // bold
	italic: '\x1b[3m', // non-standard feature
	underscore: '\x1b[4m',
	blink: '\x1b[5m',
	reverse: '\x1b[7m',
	hidden: '\x1b[8m',

	fg: {
		black: '\x1b[30m',
		red: '\x1b[31m',
		green: '\x1b[32m',
		yellow: '\x1b[33m',
		blue: '\x1b[34m',
		magenta: '\x1b[35m',
		cyan: '\x1b[36m',
		white: '\x1b[37m',
		crimson: '\x1b[38m'
	},

	bg: {
		black: '\x1b[40m',
		red: '\x1b[41m',
		green: '\x1b[42m',
		yellow: '\x1b[43m',
		blue: '\x1b[44m',
		magenta: '\x1b[45m',
		cyan: '\x1b[46m',
		white: '\x1b[47m',
		crimson: '\x1b[48m'
	}
};

function getCIELUMBrand() {
	return `${colors.bg.blue}[${colors.bright}CIELUMeasy W·A${colors.reset}${colors.bg.blue}]${colors.reset} `;
}

function getTag(bgColor: keyof typeof colors.bg, text: string) {
	return `${colors.bg[bgColor]} ${text} ${colors.reset}`;
}

export function logCIELUMError(message: string) {
	console.error(getCIELUMBrand(), getTag('red', 'ERROR'), colors.fg.red, message, colors.reset);
}

export function logCIELUMGeneralInfo(message: string) {
	console.log(getCIELUMBrand(), getTag('cyan', 'INFO'), colors.fg.cyan, message, colors.reset);
}

export function getWebConsoleLogger() {
	const brand = 'CIELUMeasy W·A';
	return {
		getErrorForDeveloperToFix: (message: string) => {
			throw new Error(`${brand} DevError: ${message}`);
		},
		getBackendError: (error: AxiosError) => {
			return `${brand} BackendError: ${error.message}`;
		}
	};
}

export function isFeatureEnabled(feature: keyof Tenant['features']) {
	return env.tenant.features[feature].enabled;
}
