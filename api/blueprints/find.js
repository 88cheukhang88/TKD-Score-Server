/**
 * Module dependencies
 */
var util = require('util'),
  actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');



/**
 * Find Records
 *
 *  get   /:modelIdentity
 *   *    /:modelIdentity/find
 *
 * An API call to find and return model instances from the data adapter
 * using the specified criteria.  If an id was specified, just the instance
 * with that unique id will be returned.
 *
 * Modified for use with optionally single search attribute 'search'
 *
 * Optional:
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 * @param {String} search  - Applied to many record attributes to find records
 * 
 */






module.exports = function findRecords (req, res) {

  // Look up the model
  var Model = actionUtil.parseModel(req);


  // If an `id` param was specified, use the findOne blueprint action
  // to grab the particular instance with its primary key === the value
  // of the `id` param.   (mainly here for compatibility for 0.9, where
  // there was no separate `findOne` action)
  if ( actionUtil.parsePk(req) ) {
    //return require('../../node_modules/sails/lib/hooks/blueprints/actions/fineOne')(req,res);

  }




  //if a 'typeahead' param was specified, use the typeahead blueprint action
  if(req.param('typeahead')) {
    return require('../../api/blueprints/typeahead')(req,res);
  } 




  // If search param was specified present - prepare a cool multi attribute search
  // if not, just grab the keys and do a normal find

  var queryWhere = {or:[]};
  if ( req.param('search') && Model.searchAttributes) { 

    _.each(Model.searchAttributes, function(att) {
      var obj = {};
      obj[att] = {contains: req.param('search')};
      queryWhere.or.push(obj); 
    });
  } else {
    queryWhere = actionUtil.parseCriteria(req);
  }




  // Lookup for records that match the specified criteria
  var query = Model.find()
  .where( queryWhere )
  .limit( actionUtil.parseLimit(req) )
  .skip( actionUtil.parseSkip(req) )
  .sort( actionUtil.parseSort(req) );
  // TODO: .populateEach(req.options);
  query = actionUtil.populateEach(query, req);
  query.exec(function found(err, matchingRecords) {
    if (err) {return res.serverError(err);}

    // Only `.watch()` for new instances of the model if
    // `autoWatch` is enabled.
    if (req._sails.hooks.pubsub && req.isSocket) {

      Model.subscribe(req, matchingRecords);
      log.silly(req.socket.id, ' subscribing to');
      _.each(matchingRecords, function(record) {
        log.silly(record.toString());
      })
      if (req.options.autoWatch) { Model.watch(req); }
      // Also subscribe to instances of all associated models
      _.each(matchingRecords, function (record) {
        actionUtil.subscribeDeep(req, record);
      });
    }

    res.ok(matchingRecords);
  });
  
};
