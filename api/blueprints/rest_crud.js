
var _ = require('lodash');
var LoggerCollection = require('../Logger/LoggerMdl.js');

factory = function(obj, primaryKey){
	if(!primaryKey) { primaryKey = '_id';}


	obj.create = function create(req, res, next) {
		obj.Collection.create(req.body, function(err, doc) {
			if(err) {
				return next(err);
			}
			LoggerCollection.add(req.session.user, 'created ' + req.body);
			res.ok(doc);
		});
	};

	obj.destroy = function destroy(req, res, next) {
		var search = {};
		search[primaryKey] = req.params.id;
		obj.Collection.findOneAndRemove(search, function(err, doc) {
			if(err) {return next(err);}
			if(!doc) {return res.notFound('Could not find item');} 
			LoggerCollection.add(req.session.user, 'deleted ' + req.body);
			res.ok();
		});
	};

	obj.find = function find(req, res, next) {
		
		var limit = req.body.limit;
		var start = req.body.offset;
		var sort = req.body.sort;
		var options = req.body.options;

		delete(req.body.limit);
		delete(req.body.offset);
		delete(req.body.sort);
		delete(req.body.options);
		

		obj.Collection.find(req.body, function(err, docs) {
			if(err) {return next(err);}
			if(!docs) {return res.ok([]);} 
			res.ok(docs);
		});
	};

	obj.findId = function findId(req, res, next) {
		//log.silly(req.ip + ' has requested user id ' + req.params.id);
		var search = {};
		search[primaryKey] = req.params.id;

		obj.Collection.findOne(search, function(err, doc) {
			if(err) {return next(err);}
			if(!doc) {return res.notFound('Could not find item');} 
			res.ok(doc);
		});
	};	

	obj.update = function update(req, res, next) {
		//log.silly(req.ip + ' is updating user id ' + req.params.id);

		// This does 2 calls to Mongo - one to get the data, then one to save the updated document.
		// Can it be done a single update command???

		var search = {};
		search[primaryKey] = req.params.id;
		obj.Collection.findOne(search, function(err, doc) {
			if(err) {return next(err);}
			if(!doc) {return res.notFound('Could not find item');} 

			_.merge(doc, req.body);
			doc.save(function(err, doc) {
				if(err) {return next(err);}
				LoggerCollection.add(req.session.user, 'updated ' + req.body);
				res.ok(doc);
			});
			
		});
	};
};

module.exports = factory;