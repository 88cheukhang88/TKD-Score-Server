

var log = require('../../lib/logger.js');


var Collection = this.Collection = require('./MatchMdl.js');
var self = this;



///////////////// DECLARE ROUTE PREFIX ////////////////////////
this.routePrefix = '/match';
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

	{
		method: 'post',
		url: this.routePrefix,
		action: this.create,
	},

	{
		method: 'put',
		url: this.routePrefix + '/:id',
		action: this.update,
	},

	{
		method: 'delete',
		url: this.routePrefix + '/:id',
		action: this.destroy,
	}
];


module.exports = this;