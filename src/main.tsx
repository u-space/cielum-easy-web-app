import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import env from './vendor/environment/env';

import App from './app/app';
import './app/i18n';

function setFavicons(ico: string) {
	const head = document.querySelector('head');
	const setFavicon = document.createElement('link');
	setFavicon.setAttribute('rel', 'icon');
	setFavicon.setAttribute('href', ico);
	if (head) head.appendChild(setFavicon);
}

// Function that changes the title of the document
function setDocumentTitle(title: string) {
	document.title = title;
}

function renderMainApp() {
	const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>
	);
}

renderMainApp();
setFavicons(`${env.public_url}/vendor/assets/${env.tenant.assets.favicon}`);
setDocumentTitle(env.tenant.short_name);
