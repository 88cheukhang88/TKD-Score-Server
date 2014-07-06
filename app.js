

var _ = require('lodash');
var log = require('./lib/logger.js');

var Utils = require('./lib/utils');

var config = require('./config.js');





/********************************************************/
/* Prepare Express										*/
/********************************************************/

var express = require('express');
var app = module.exports = express();

///// Load config into app so we can access it easily
_.forEach(config, function(arg, key) {
	app.set(key, arg) ;
});

///// Import externally set options
app.set('env', process.env.TVUR_ENV || app.get('env'));

if( ['development', 'staging', 'testing', 'production'].indexOf(app.get('env')) === -1) {
	throw new Error('Environment ' + app.get('env') + ' is not allowed');
}

app.set('port', process.env.TKD_PORT || app.get('port'));
app.set('loglevel', process.env.TKD_LOGLEVEL || app.get('loglevel'));
log.transports.console.level = app.get('loglevel');



var bodyParser = require('body-parser');
app.use(bodyParser());


var cookieParser = require('cookie-parser');
app.use(cookieParser('optional secret string'));

var expressSession = require('express-session');
app.use(expressSession({
	secret: app.get('SESSION_SECRET'), 
	name: 'sid', 
	cookie:{secure:false}
}));



// Extend the response obj with some custom response helpers 
Utils.loadAllFilesIntoObj(__dirname + '/api/responses/', express.response);







/********************************************************/
/* Load Up Mongoose										*/
/********************************************************/

switch(app.get('env')) {
	case 'testing' :
		app.set('mongo_uri', app.get('MONGO_TESTING_URI'));
		break;
	case 'development' :
		app.set('mongo_uri', app.get('MONGO_DEVELOPMENT_URI'));
		break;
	case 'staging' :
		app.set('mongo_uri', app.get('MONGO_STAGING_URI'));
		break;
	case 'production' :
		app.set('mongo_uri', app.get('MONGO_PRODUCTION_URI'));
		break;
	default:
		app.set('mongo_uri', app.get('MONGO_DEVELOPMENT_URI'));
	
}

var mongoose = require('mongoose');

var db = mongoose.connect(app.get('mongo_uri'));
mongoose.connection.on('error', function(err) {
	throw err;
});



// Extend our validator (mongules for now) with some custom validators
var validator = require('mongules');

validator.extend('hasNumber', function(str) {
    return /[0-9]/.test(str);
});
validator.hookMsg(
    'hasNumber', 'Must contain at least one number'
);

validator.extend('hasUpperLetter', function(str) {
    return /[A-Z]/.test(str);
});
validator.hookMsg(
    'hasUpperLetter', 'Must contain at least one uppercase letter'
);

validator.extend('hasLowerLetter', function(str) {
    return /[a-z]/.test(str);
});
validator.hookMsg(
    'hasLowerLetter', 'Must contain at least one lowercase letter'
);






/********************************************************/
/* Load Extras											*/
/********************************************************/




/********************************************************/
/* Prepare Passport										*/
/********************************************************/


// README: http://aleksandrov.ws/2013/09/12/restful-api-with-nodejs-plus-mongodb/

//var passport = require('passport');
//app.use(passport.initialize());






/********************************************************/
/* Load Controllers										*/
/********************************************************/

Utils.loadController(app, require('./api/Hello/HelloCtrl.js'));
Utils.loadController(app, require('./api/Logger/LoggerCtrl.js'));






/********************************************************/
/* Load Error Handler									*/
/********************************************************/

var developmentErrorHandler = function (err, req, res, next) {
	if (req.is('json')) {
		log.error(err);
		return res.internalError(null, err);

	} else {
		return next(err);
	}
};

var productionErrorHandler = function (err, req, res, next) {
	if (req.is('json')) {
		log.error(err);
		console.log('hello');
		return res.internalError('Sorry - Something blew up! Please contact support.', err);
	} else {
		return next(err);
	}
};

var validationErrorHandler = function (err, req, res, next) {
	if(err) {
		if(err.name === "MongoError" && err.code === 11000) {

			// Intercept mongo duplicatr key error and throw as a validation error
			// extract info from mongo error string
			var path = err.err.match(/\$[a-zA-Z0-9]+/)[0].replace('$','');
			var value = err.err.match(/"\w+/)[0].replace(/"/,'');
			
			var uniqueError = {
				name: 'ValidationError',
				message: value + ' is not available',
				path: path,
				err: err
			};
			log.verbose('Mongo Duplicate Key Error:');
			log.verbose(uniqueError);
			return res.validationError(null, uniqueError);
		}

		if(err.name === "ValidationError") {
			return res.validationError(null, err);
		} else {
			return next(err);
		}
	}
};

app.use(validationErrorHandler);

switch(app.get('env')) {
	case 'production' :
		app.use(productionErrorHandler);
		break;

	case 'testing':
	case 'development' :
	case 'staging' :
		app.use(developmentErrorHandler);
		break;
	default:
		app.use(developmentErrorHandler);
}




/********************************************************/
/* Launch Application									*/
/********************************************************/
mongoose.connection.once('open', function(){
	app.listen(app.get('port'));
	
	log.info('Mongoose has opened a connection to ' + app.get('mongo_uri'));
	log.msg('Console will show logs up to ' + app.get('loglevel') + ' messages');
	log.msg(app.get('NAME') + ' is Listening on ' + app.get('port') + ' in ' + app.get('env') + ' mode...');
	console.log(); 

	app.set('state', 'ready');
	app.emit('ready');
});
