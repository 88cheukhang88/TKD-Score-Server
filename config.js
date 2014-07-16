

var packagejson = require('./package.json');


var config = module.exports = {
	NAME: packagejson.name,
	VERSION: packagejson.version,

	env: 'development',
	port: 3000,
	loglevel: 'verbose',

	MONGO_DEVELOPMENT_URI : 'mongodb://localhost/tkdscore',
	MONGO_STAGING_URI : 'mongodb://localhost/tkdscore',
	MONGO_PRODUCTION_URI: 'mongodb://localhost/tkdscore',
	MONGO_TESTING_URI: 'mongodb://localhost/tkdscore_test',
	
	API_ROUTE_PREFIX: '/api',
	SESSION_SECRET: 'whatthefuckisthisallabout',
};
