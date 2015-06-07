/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var chalk = require('chalk');

module.exports.bootstrap = function(cb) {


	sails.on('lifted', function() {

		// work out the ip addresses
		var listAddresses = [];
		var os = require('os');
		var ifaces = os.networkInterfaces();

		Object.keys(ifaces).forEach(function (ifname) {
		  var alias = 0;

		  ifaces[ifname].forEach(function (iface) {
		    if ('IPv4' !== iface.family || iface.internal !== false) {
		      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
		      return;
		    }

		    if (alias >= 1) {
		      // this single interface has multiple ipv4 addresses
		      listAddresses.push(iface.address);
		    } else {
		      // this interface has only one ipv4 adress
		      listAddresses.push(iface.address);
		    }
		  });
		});

		// load the package json file
		var pjson = require('../package.json');

		// Display welcome message
	    var r = chalk.red;
	    var b = chalk.blue;
	    var w = chalk.white
	    console.log(r('###################') + b('###################'));
	    console.log(r('############# ') + w('TKD SCORE') + b(' ##############'));
	    console.log(r('###################') + b('#############') + w('v'+pjson.version));
	    console.log();
	    console.log('Point web browser to: ' + listAddresses[0] + ':' + sails.config.port);
	    
	    console.log(chalk.grey('--------------------------------------'));
	    console.log();
	});

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};
