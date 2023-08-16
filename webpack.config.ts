const { default: env } = require('./src/vendor/environment/env');
const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');
const path = require('path');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

function getTenantSpecificImplementationsExtensions(specificImplementations: string[] = []) {
	let extensions = ['.ts', '.tsx', '.mjs', '.js', '.jsx'];
	for (const feature of specificImplementations) {
		extensions = [...extensions.map((ext) => `.${feature}${ext}`), ...extensions];
	}
	return extensions;
}

module.exports = composePlugins(withNx(), withReact(), (config: any) => {
	// Update the webpack config as needed here.
	// e.g. `config.plugins.push(new MyPlugin())`
	config.devServer = { ...config.devServer, port: env.dev_server.port };
	config.resolve.extensions = getTenantSpecificImplementationsExtensions(
		env.tenant.specific_implementations
	);
	config.resolve = {
		...config.resolve,
		alias: {
			...config.resolve.alias,
			svelte: path.resolve('node_modules', 'svelte')
		},
		extensions: [...config.resolve.extensions, '.mjs', '.js', '.svelte'],
		mainFields: [...config.resolve.mainFields, 'svelte', 'browser', 'module', 'main']
	};
	config.module = {
		...config.module,
		rules: [
			...config.module.rules,
			{
				test: /\.(html|svelte)$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							// NOTE Svelte's dev mode MUST be enabled for HMR to work
							dev: !prod // Default: false
						},

						// NOTE emitCss: true is currently not supported with HMR
						// Enable it for production to output separate css file
						emitCss: prod, // Default: false
						hotReload: !prod, // Default: false
						preprocess: [
							require('svelte-preprocess')({
								/* options */
							})
						]
					}
				}
			},
			{
				// required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			},
			{
				test: /\.js$/,
				exclude: [/node_modules\/svelte-query/]
			},
			{
				test: /\.md$/,
				type: 'asset/source'
			},
			{
				test: /\.(ico|ts\.sample)$/,
				type: 'asset/resource'
			},
			{
				test: /\.gltf$/,
				type: 'asset/resource'
			}
			/*{
					test: /\.css$/,
					use: [
						MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								url: false // necessary if you use url('/path/to/some/asset.png|jpg|gif')
							}
						}
					]
				}*/
		]
	};
	return config;
});
