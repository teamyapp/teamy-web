import { FetchPolicy, gql } from '@apollo/client';
import { User } from '../entity/User';
import { GraphQLClient } from '../network/GraphQL.client';

export class UserService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchMe(policy: FetchPolicy): Promise<User> {
        return this.graphQLClient
            .query(
                { query: QueryMe, fetchPolicy: policy },
            )
            .then((payload: any) => {
                return payload?.me;
            });
    }
}


const QueryMe = gql`
query Me {
   me{
    id
    firstName
    lastName
    profileUrl
  } 
}
`