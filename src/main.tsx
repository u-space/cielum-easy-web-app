import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import env from './vendor/environment/env';
import packageInfo from '../package.json';
import App from './app/app';
import './app/i18n';
import { getAssetPath } from './app/utils';
import Helmet from 'react-helmet';

function setFavicons(ico: string) {
	const head = document.querySelector('head');
	const setFavicon = document.createElement('link');
	setFavicon.setAttribute('rel', 'icon');
	setFavicon.setAttribute('href', ico);
	if (head) head.appendChild(setFavicon);
}

function renderMainApp() {
	const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
	root.render(
		<StrictMode>
			<Helmet>
				{env.tenant.assets.override_css && (
					<link rel="stylesheet" href={getAssetPath(env.tenant.assets.override_css)} />
				)}
				<title>{`${env.tenant.short_name} (v${packageInfo.version})`}</title>
			</Helmet>
			<App />
		</StrictMode>
	);
}

renderMainApp();
setFavicons(`${env.public_url}/vendor/assets/${env.tenant.assets.favicon}`);
