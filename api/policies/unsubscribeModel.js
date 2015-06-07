var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');


module.exports = function(req, res, next) {
	var Model = actionUtil.parseModel(req);

    Model.find().exec(function(err, records) {
    	Model.unsubscribe(req.socket, records);
    	log.silly('Unsubscribing Sockets on all ' + Model.toString());
    	_.each(records, function(record) {
    		log.silly(record.toString());
    	})
    	next();
    })
};