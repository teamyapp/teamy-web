import { User } from '@core/entityv2/user';
import {gql} from "@apollo/client";
import {GraphQLClient} from "@lib/network/GraphQL.client";

export interface CreateUserInput {
    lastName: string;
    firstName: string;
    profileUrl?: string;
}

export interface UpdateUserInput {
    lastName: string;
    firstName: string;
    profileUrl?: string;
}

export class UserClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public getMe(): Promise<User> {
        return this.graphQLClient.query({
            query: gql`
                query getMe {
                    me {
                        id
                        firstName
                        lastName
                        profileUrl
                        createdAt
                        teams {
                            id
                            name
                            iconUrl
                        }
                    }
                }`,
        })
        .then((payload: any) => payload.getMe);
    }

    public createUser(input: CreateUserInput): Promise<User> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation createUser($input: CreateUserInput!) {
                    createUser(user: $input) {
                        id
                    }
                }
            `,
            variables: {
                input,
            },
        })
        .then((payload: any) => payload.createUser);
    }

    public updateUser(userId: number, input: UpdateUserInput): Promise<User> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation updateTask($userId: ID!, $input: UpdateUserInput!) {
                    updateUser(userId : $userId, input : $input) {
                        id
                    }
                }
            `,
            variables: {
                userId,
                input,
            },
        })
        .then((payload: any) => payload.updateUser);
    }
}
