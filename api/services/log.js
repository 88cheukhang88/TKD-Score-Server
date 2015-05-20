var winston = require('winston');

var myCustomLevels = {
    levels: {
    	msg: 10,
    	error: 9,
        mat: 8,
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

logger.add(winston.transports.Console, {colorize: true, level:sails.config.log.level});

winston.addColors(myCustomLevels.colors);

module.exports = logger;