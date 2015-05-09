/**
 * Module dependencies
 */
var util = require('util'),
  actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');



/**
 *
 * Optional:
 * @param {String} typeahead - ALternate search that produces a list of unique entries in the table
 * @param {String} field - Used only with typeahead to designate the search field, if not given will use 'text'
 * 
 */


module.exports = function typeahead (req, res) {

  // Look up the model
    var Model = actionUtil.parseModel(req);

    textEntity = req.param('field') || 'text';

    var validator = require('validator');

    var findString = req.param('typeahead');
    findString = validator.escape(findString);

    var organisation = req.param('organisation');
    organisation = validator.escape(organisation);

    query = 'SELECT DISTINCT ' + textEntity + ' FROM ' + Model.tableName + ' WHERE organisation="'+ organisation + '" AND ' + textEntity + ' LIKE "%' + findString + '%"';
      
    Model.query(query, function(err, results) {
        if (err) {return res.serverError(err);}

        res.ok(results);
    });

  
};
