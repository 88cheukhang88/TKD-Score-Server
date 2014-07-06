var config = require('../../config.js');





this.hello = function(req, res, next) {
	res.ok({hello:'world'});
};

this.resVersion = function(req, res) {
	res.ok({version:config.VERSION, mode: config.MODE});
};

this.routes = [
	{
		method: 'get',
		url: '/hello',
		action: this.hello,
	},
	{
		method: 'get',
		url: '/hello/version',
		action: this.resVersion,
	}
];

module.exports = this;