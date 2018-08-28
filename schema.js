/*
 * The test endpoint just a placeholder since the base schema
 * needs to have a Mutation type that can be extended.
 */
const baseSchema = `
  # the schema allows the following query:
  type Query {
    version: String
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
