/**
 * Module dependencies
 */
var util = require('util'),
  actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');



/**
 * Destroy Many Records
 *
 * delete  /:modelIdentity/?id=[]
 *    *    
 *
 * Destroys multiple model instances with the specified `id` from
 * the data adapter for the given model if it exists.
 *
 * Required:
 * @param [Integer|String] id  - the unique id's of the particular instance you'd like to delete
 * @param [Integer|String] organisation  - the organisation parent of the particular instances you'd like to delete
 *
 *
 * Optional: 
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */
module.exports = function destroyManyRecords (req, res) {

  var Model = actionUtil.parseModel(req);

  var filter = req.param('id');
  var organisation = req.param('organisation');

  // Convert the string representation of the filter list to an Array. We
    // need this to provide flexibility in the request param. This way both
    // list string representations are supported:
    //   /?id=alias1,alias2,alias3
    //   /?id=[alias1,alias2,alias3]
    if (typeof filter === 'string') {
      filter = filter.replace(/\[|\]/g, '');
      filter = (filter) ? filter.split(',') : [];
    }

  //var pk = actionUtil.requirePk(req);

  var query = Model.find({id:filter, organisation:organisation});
  query = actionUtil.populateEach(query, req);
  query.exec(function foundRecord (err, records) {
    if (err) {return res.serverError(err);}
    if(!records.length) {return res.notFound('No records found with the specified `id`.');}

    Model.destroy({id:filter, organisation:organisation}).exec(function destroyedRecord (err) {
      if (err) {return res.negotiate(err);}

      if (sails.hooks.pubsub) {
        Model.publishDestroy(filter, !sails.config.blueprints.mirror && req, {previous: records});
        if (req.isSocket) {
          Model.unsubscribe(req, records);
          Model.retire(records);
        }
      }

      return res.ok(records);
    });
  });
};
