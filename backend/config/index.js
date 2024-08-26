'use strict';
const fs = require('fs');
const ports = [];
const envName = process.env.NODE_ENV || 'development';
const rootDir = process.cwd() + '\\';
const envObj = JSON.parse(fs.readFileSync(`./config/.env.${envName}.json`));

let mongoDb = {
	dbName: 'FlightSearch',
	username: '???',
	password: '???',
};
let redisDb = {
	username: '???',
	password: '???',
	host: '???',
	port: 1234,
};

switch (envName) {
	case 'staging':
		ports.push(3000);
		mongoDb = {
			...mongoDb,
			...{ username: 'TBD', password: 'TBD' },
		};
		redisDb = {
			...redisDb,
			...{
				username: 'TBD',
				password: 'TBD',
				host: 'TBD',
				port: 1234,
			},
		};
		break;
	case 'production':
		ports.push(8080, 443);
		mongoDb = {
			...mongoDb,
			...{ username: 'TBD', password: 'TBD' },
		};
		redisDb = {
			...redisDb,
			...{
				username: 'TBD',
				password: 'TBD',
				host: 'TBD',
				port: 1234,
			},
		};
		break;
	default: // aka development
		ports.push(3000);
		mongoDb = {
			...mongoDb,
			...envObj.mongoDb,
		};
		redisDb = {
			...redisDb,
			...envObj.redisDb,
		};
		break;
}

const app = {
	envName,
	ports,
	rootDir,
	mongoDb,
	redisDb,
};

exports = module.exports = {
	app,
};
