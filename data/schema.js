/**
 * Created by Lukas on 14-Nov-16.
 */
const typedefs = `
type User {
  id: Int!
  firstName: String
  lastName: String
}
type Query {
  users: [User]
}
type Mutation {
  addUser(
    firstName: String!
    lastName: String!
  ): User
}
type Subscription {
 userAdded: User
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`;

export default [typedefs];