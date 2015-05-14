/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

/*
  '/': {
    view: 'homepage'
  },
*/

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/


// Custom routes here...
    'post /api/login': {
        controller: "Auth",
        action: "login",
    },

    'get /api/logout': {
        controller: "Auth",
        action: "logout",
    },

    'get /api/login': {
        controller: "Auth",
        action: "status",
    },



    'post /api/match/controls/pauseresume': {
        controller: "Match",
        action: "pauseResume",
    },

    'post /api/match/controls/points': {
        controller: "Match",
        action: "points",
    },

    'post /api/match/controls/penalties': {
        controller: "Match",
        action: "penalties",
    },

    'post /api/match/controls/changeRound': {
        controller: "Match",
        action: "changeRound",
    },

    'post /api/match/controls/resetTimer': {
        controller: "Match",
        action: "resetTimer",
    },

    'post /api/match/controls/resetMatch': {
        controller: "Match",
        action: "resetMatch",
    },

    'post /api/match/controls/soundhorn': {
        controller: "Match",
        action: "soundhorn",
    },

    'post /api/match/controls/registerscore': {
        controller: "Match",
        action: "registerscore",
    },

    'post /api/match/removejudge': {
        controller: "Match",
        action: "removeJudge",
    },

    'post /api/match/judge': {
        controller: "Match",
        action: "registerJudge",
    },



};
