var winston = require('winston');

var myCustomLevels = {
    levels: {
        mat: 11,
    	msg: 10,
    	error: 9,
    	warn: 7,
    	info: 6,
    	debug: 5,
    	verbose: 4,
    	silly: 3,
        clock: 1,
    },
    colors: {
        msg: 'white',
    	error: 'red',
        mat: 'magenta',
    	warn: 'yellow',
    	info: 'cyan',
  		debug: 'blue',
		verbose: 'green',
		silly: 'rainbow',
        clock: 'grey',
    }
};


var logger = new (winston.Logger)({
	levels: myCustomLevels.levels,
}); 

var loglevel = sails.config.log.level;
if (sails.config.environment === 'production') {
    loglevel = 'mat';
}

logger.add(winston.transports.Console, {colorize: true, level:loglevel});


winston.addColors(myCustomLevels.colors);

module.exports = logger;