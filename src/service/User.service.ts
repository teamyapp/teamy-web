import { User } from '../entity/User';
import { GraphQLClient } from '../network/GraphQL.client';

export class UserService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchMe(): Promise<User> {
        return this.graphQLClient
            .query(
                `
query {
   me{
    id
    firstName
    lastName
    profileUrl
  } 
}
`,
            )
            .then((payload: any) => {
                return payload?.me;
            });
    }
}
