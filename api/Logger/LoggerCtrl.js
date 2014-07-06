

var log = require('../../lib/logger.js');
var Utils = require('../../lib/utils');

var Collection = this.Collection = require('./LoggerMdl.js');
var self = this;

var _ = require('lodash');



///////////////// DECLARE ROUTE PREFIX ////////////////////////
this.routePrefix = '/logger';
///////////////////////////////////////////////////////////////

///////////////// LOAD BLUEPRINT FUNCTIONS ////////////////////
require(__dirname + '/../blueprints/rest_crud.js')(this);
///////////////////////////////////////////////////////////////

	

/*********************
this.routes = [
	{
		method: 'get',
		url: '/user',
		action: this.find,
	},
OR
	{
		method: 'get',
		url: '/user',
		action: [someMiddleFunction, this.find]
	},
]

These routes can be loaded by the util function - Utils.loadController(app, require('aController.js')
/********************/

this.routes = [
	{
		method: 'get',
		url: this.routePrefix,
		action: this.find,
	},

	{
		method: 'get',
		url: this.routePrefix + '/:id',
		action: this.findId,
	},
];


module.exports = this;