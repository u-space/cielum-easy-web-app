const { spawn, execSync } = require('child_process');
const chalk = require('chalk');

console.log('>', JSON.stringify(chalk));
const exec = (commands) => {
	execSync(commands, { stdio: 'inherit', shell: true });
};

function cleanUp() {
	// Delete backups and all tenant files that are not used
	console.log(chalk.bold('Deleting backups and other unused files...'));
	exec('npx rimraf ./src/_env_backup -v');
	exec('npx rimraf ./src/_defaults_backup -v');
	exec('npx rimraf ./src/vendor/configured_envs_do_not_share_secrets -v');
}

const spawnProcess = (commands) => {
	spawn(commands, { stdio: 'inherit', shell: true });
};
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true
});

const colors = {
	uncolorize: (str) => str.replace(/\x1B\[\d+m/gi, ''),
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
	return `${colors.bg.blue}[${colors.bright}CIELUMeasy${colors.reset}${colors.bg.blue}]${colors.reset} `;
}

console.log();
console.log();
console.log(getCIELUMBrand());
console.log();
console.log(chalk.bold('Welcome to CIELUMeasy copy tenants script!'));
console.log(
	'This script will copy all tenant assets and variables from a github repo into the current project'
);
console.log(chalk.bgBlueBright('Please take the following into consideration:'));
console.log('1. This script will delete the current vendor folder and clone the repo into it');
console.log(
	'2. However, it will backup env.ts, env.prod.ts and tenant.ts files, as well as _default.prod.ts, _default.ts and _types.ts files'
);
console.log(
	'3. If you want to recover the backed up files, you can do so by answering yes to the last question'
);
console.log(
	'4. If you want to create new files from template, you can do so by answering no to the last question'
);
console.log(
	'5. It is not recommended to recover from template if you are executing this script due to new variables being added to the tenant files, please update the remote repo instead'
);

console.log();
rl.question(chalk.red('What is the tenants github repo .git url? '), (github) => {
	// Copy env.ts, env.prod.ts and tenant.ts files that are inside vendor folder out of the folder as a backup
	console.log(chalk.bold('Copying env.ts, env.prod.ts and tenant.ts files as a backup...'));
	// This command works in Windows and Linux, using the package copyfiles
	exec('npx rimraf _env_backup');
	exec(
		'npx copyfiles -f ./src/vendor/environment/{env.ts,env.prod.ts,tenant.ts} ./src/_env_backup'
	);
	// Copy _default.prod.ts, _default.ts and _types.ts
	console.log(chalk.bold('Copying _default.prod.ts, _default.ts and _types.ts...'));
	exec(
		'npx copyfiles -f ./src/vendor/environment/{_default.prod.ts,_default.ts,_types.ts} ./src/_defaults_backup'
	);
	// Delete vendor folder
	console.log(chalk.bold('Deleting vendor folder...'));
	exec('npx rimraf ./src/vendor');
	console.log(chalk.bold('Cloning latest commit of repo...'));
	exec('git clone -b main --single-branch --depth 1 ' + github + ' ./src/vendor/');
	console.log(chalk.bold('Removing git folder of cloned repo...'));
	exec('npx rimraf ./src/vendor/.git');

	rl.question(
		chalk.red('Should we recover backed up files or create new ones from template? (R/c) '),
		(answer) => {
			if (answer === 'R' || answer === 'r' || answer.toLowerCase() === 'recover') {
				console.log(chalk.bold('Recovering backed up files...'));
				exec('npx copyfiles -f ./src/_env_backup/* ./src/vendor/environment/');
				exec('npx copyfiles -f ./src/_defaults_backup/* ./src/vendor/environment/');
				cleanUp();
				rl.close();
			} else {
				rl.question(chalk.red('What is the tenant name? '), (tenantName) => {
					console.log(chalk.bold('Copying tenant files to vendor folder...'));
					exec(
						`npx copyfiles -f ./src/vendor/configured_envs_do_not_share_secrets/${tenantName}/* ./src/vendor/environment -E`
					);
					const replace = require('replace-in-file');
					const options = {
						files: './src/vendor/environment/tenant.ts',
						from: /\.\S+\/_types/g,
						to: './_types'
					};
					try {
						const results = replace.sync(options);
						console.log('Replacement results:', results);
					} catch (error) {
						console.error('Error occurred:', error);
					}
					cleanUp();
					rl.close();
				});
			}
		}
	);
});
