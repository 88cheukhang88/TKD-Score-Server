var winston = require('winston');

var myCustomLevels = {
    levels: {
    	msg: 9,
    	error: 8,
    	warn: 7,
    	info: 6,
    	debug: 5,
    	verbose: 4,
    	silly: 3,
    },
    colors: {
    	msg: 'white',
    	error: 'red',
    	warn: 'yellow',
    	info: 'cyan',
  		debug: 'blue',
		verbose: 'green',
		silly: 'rainbow',
    }
};


var logger = new (winston.Logger)({
	levels: myCustomLevels.levels,
}); 

logger.add(winston.transports.Console, {colorize: true, level:sails.config.log.level});

winston.addColors(myCustomLevels.colors);

module.exports = logger;