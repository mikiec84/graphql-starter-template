

const middlewares = [
  function sample(req, res, next) {
    // You can insert middleware code here, or just delete this function.
    console.log('Mid ' + req.session.id);

    next();
  },
];

module.exports = middlewares;
