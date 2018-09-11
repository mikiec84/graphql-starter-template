const parseurl = require('parseurl');
const getDbConnection = require('../common/db');
const cache = require('coa-web-cache');
const logger = require('../common/logger');

const middlewares = [
  // The following code just exercises the session and login
  // modules - it can be deleted in a production app.
  function (req, res, next) {
    if (!req.session) {
      req.session = {};
    }
  
    if (!req.session.views) {
      req.session.views = {};
    }
    const pathname = parseurl(req).pathname;
    req.session.views[pathname] = (req.session.views[pathname] || 0) + 1;
    console.log(`The email here is ${req.session.email}`);
    cache.get(req.session.id)
    .then(sessionId => {
      console.log(`View count is ${JSON.stringify(req.session.views)} for ${sessionId}`);
      next();
    });
  },
];

module.exports = middlewares;
