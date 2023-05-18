import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
import uiEN from './locales/ui.en.json';
import uiES from './locales/ui.es.json';
import localeGlossaryEN from './locales/glossary.en.json';
import localeGlossaryES from './locales/glossary.es.json';
import env from '../../vendor/environment/env';
import { getAssetPath } from '../utils';

const resources = {
	en: {
		ui: uiEN,
		glossary: localeGlossaryEN
	},
	es: {
		ui: uiES,
		glossary: localeGlossaryES
	}
};

const language =
	document.cookie.indexOf('language=') !== -1
		? document.cookie.split('language=')[1].split(';')[0]
		: 'es';
i18n.on('initialized', async () => {
	if (env.tenant.assets.extra_locales) {
		if (env.tenant.assets.extra_locales.ui) {
			for (const language of Object.keys(env.tenant.assets.extra_locales.ui)) {
				fetch(getAssetPath(env.tenant.assets.extra_locales.ui[language])).then(
					(response) => {
						response.json().then((json) => {
							i18n.addResourceBundle(language, 'ui', json, true, true);
						});
					}
				);
			}
		}
		if (env.tenant.assets.extra_locales.glossary) {
			for (const language of Object.keys(env.tenant.assets.extra_locales.glossary)) {
				fetch(getAssetPath(env.tenant.assets.extra_locales.glossary[language])).then(
					(response) => {
						response.json().then((json) => {
							i18n.addResourceBundle(language, 'glossary', json, true, true);
						});
					}
				);
			}
		}
	}
});
i18n
	// detect user language
	//use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: language,
		debug: false,
		defaultNS: 'ui',
		ns: ['ui', 'glossary'],
		interpolation: {
			escapeValue: false // react already safes from xss
		},
		keySeparator: '.',
		load: 'all',
		// special options for react-i18next
		// learn more: https://react.i18next.com/components/i18next-instance
		react: {
			useSuspense: true
		}
	});

export default i18n;
