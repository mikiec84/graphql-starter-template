const { merge } = require('lodash');
const { version } = require('./package.json');
const resolverMap = {
  Query: {
    version(obj, args, context) {
      return version;
    },
    user(obj, args, context) {
      const cData = context.cache.get(context.session.id);
      if (cData && cData.user) {
        const u = cData.user;
        return {
          name: u.name,
          email: u.email,
          position: u.position,
          department: u.department,
          division: u.division,
          supervisor: u.supervisor,
          supervisor_email: u.supervisor_email,
        };
      } else {
        return {
          name: null,
          email: null,
          position: null,
          department: null,
          division: null,
          supervisor: null,
          supervisor_email: null,
        };
      }
    }
  },
  Mutation: {
    test(obj, args, context) {
      return 'You have successfully called the test mutation';
    },
  }
};

const apiResolvers = require('./api').resolvers;
const loginResolvers = require('coa-web-login').graphql.resolvers;

module.exports = merge(
  resolverMap,
  apiResolvers,
  loginResolvers
);
