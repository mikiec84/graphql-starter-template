/*
 * The test endpoint just a placeholder since the base schema
 * needs to have a Mutation type that can be extended.
 */
const baseSchema = `
  # the schema allows the following query:

  type User {
    id: Int
    name: String
    email: String
    position: String
    department: String
    division: String
    supervisor_id: Int
    supervisor: String
    supervisor_email: String
  }

  type Query {
    version: String
    user: User
  }

  type Dummy {
    message: String
  }
  type Mutation {
    test: Dummy
  }
`;

const schemas = [
  baseSchema,
  require('./api').schema,
  require('coa-web-login').graphql.schema
];

module.exports = schemas.reduce((accum, cur) => accum.concat(cur), '');
