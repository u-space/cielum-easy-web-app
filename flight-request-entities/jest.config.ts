/* eslint-disable */
export default {
	displayName: 'flight-request-entities',
	preset: '../jest.preset.js',
	transform: {
		'^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
		'^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }]
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	coverageDirectory: '../coverage/flight-request-entities'
};
