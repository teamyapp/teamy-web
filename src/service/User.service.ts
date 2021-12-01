import { User } from '../entity/User';
import { GraphQLClient } from '../network/GraphQL.client';

interface MeQueryPayload {
    me: User;
}

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
            .then((payload: MeQueryPayload) => {
                return payload?.me;
            });
    }
}
