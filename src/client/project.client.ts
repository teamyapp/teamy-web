
import { GraphQLClient } from "@lib/network/GraphQL.client";
import { RemoteCreateProjectInput } from "./entity/input";
import  createProject  from "./graphql/mutation/createProject.graphql";
import  updateProject  from "./graphql/mutation/updateProject.graphql";
import { print } from "graphql";
import { RemoteProject } from "./entity/remoteProject";

export class ProjectClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    createProject(teamId: string, input: RemoteCreateProjectInput): Promise<RemoteProject> {
        return this.graphQLClient
            .mutate({
                mutation: print(createProject),
                variables: {
                    teamId,
                    input,
                },
            })
            .then(({ createProject }) => createProject);
    }

    updateProject(projectId: string, input: RemoteCreateProjectInput): Promise<RemoteProject> {
        return this.graphQLClient
            .mutate({
                mutation: print(updateProject),
                variables: {
                    projectId,
                    input,
                },
            })
            .then(({ updateProject }) => updateProject);
    }

    deleteProject(projectId: string): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation deleteProject($projectId: ID!) {
                        deleteProject(projectId: $projectId) {
                            id
                        }
                    }
                `,
                variables: {
                    projectId,
                },
            })
            .then(() => undefined);
    }
}