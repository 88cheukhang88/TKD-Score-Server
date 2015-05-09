/**
 * Module dependencies
 */
var util = require('util'),
  actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');



/**
 * Destroy One Record
 *
 * delete  /:modelIdentity/:id
 *    *    /:modelIdentity/destroy/:id
 *
 * Destroys the single model instance with the specified `id` from
 * the data adapter for the given model if it exists.
 *
 * Required:
 * @param {Integer|String} id  - the unique id of the particular instance you'd like to delete
 *
 * Optional:
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */
module.exports = function destroyOneRecord (req, res) {


// START MOD
  // if array - use the custom destroylots blueprint
  var idTest = req.param('id');
  if(idTest.indexOf('[') === 0) {
    return require('../../api/blueprints/destroylots')(req,res);
  }
// END MOD

  var Model = actionUtil.parseModel(req);
  var pk = actionUtil.requirePk(req);

  var query = Model.findOne(pk);
  query = actionUtil.populateEach(query, req);
  query.exec(function foundRecord (err, record) {
    if (err) {return res.serverError(err);}
    if(!record) {return res.notFound('No record found with the specified `id`.');}

    Model.destroy(pk).exec(function destroyedRecord (err) {
      if (err) {return res.negotiate(err);}

      if (sails.hooks.pubsub) {
        Model.publishDestroy(pk, !sails.config.blueprints.mirror && req, {previous: record});
        if (req.isSocket) {
          Model.unsubscribe(req, record);
          Model.retire(record);
        }
      }

      return res.ok(record);
    });
  });
};
