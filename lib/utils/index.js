



// Loads the routes from the controllers 'routes' object
// routes = {method: 'get|post|put|delete', url : 'path/', action : [function(req,res,next){}]}
// 
this.loadController = function(app, io, obj) {
	var _ = require('lodash');
	_.forEach(obj.routes, function(route) {
		if(route.method === 'socket') {

			if(typeof(route.action) === typeof(function(){})) {
				io.on('connection', function(socket) {
					socket.on(route.event, function(){
						var data = arguments[0];
						data.source = socket.handshake.address.address;
						route.action(data, socket);
					});
				});

			} else if(typeof(route.action) === []) {
				io.on('connection', function(socket) {
					_.forEach(route.action, function(action) {
						socket.on(route.event, function(){
							var data = arguments[0];
							data.source = socket.handshake.address.address;
							action(data, socket);
						});
					});
				});

			} else {
				console.log(route);
				throw new Error('Route actions must be a function or array. Got ' + typeof(route.action));
			}

		} else {

			if(typeof(route.action) === typeof(function(){})) {
				app[route.method](app.get('API_ROUTE_PREFIX') + route.url, route.action);
				
			} else if(typeof(route.action) === []) {
				_.forEach(route.action, function(action) {
					app[route.method](app.get('API_ROUTE_PREFIX') + route.url, action);
				});

				
			} else {
				console.log(route);
				throw new Error('Route actions must be a function or array. Got ' + typeof(route.action));
			}
		}
	});
};

this.loadAllFilesIntoObj = function(path, obj) {
	var fs = require('fs');
	if(path.substring(path.length -1) !== '/') {
		path += '/';
	}

	fs.readdirSync(path).forEach(function (file) {
		if(file.substr(-3) === '.js') {
			obj[file.substring(0, file.length - 3)] = require(path + file);
		}
	});
};


module.exports = this;