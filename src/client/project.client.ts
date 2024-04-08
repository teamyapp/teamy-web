import { GraphQLClient } from "@lib/network/GraphQL.client";
import { RemoteCreateProjectInput } from "./entity/input";
import  createProject  from "./graphql/mutation/createProject.graphql";
import  updateProject  from "./graphql/mutation/updateProject.graphql";
import deleteProject  from "./graphql/mutation/deleteProject.graphql";
import getProjects from "./graphql/query/getProjects.graphql";
import { print } from "graphql";
import { RemoteProject } from "./entity/remoteProject";

export class ProjectClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    getProject(projectId: string): Promise<RemoteProject | undefined> {
        return this.graphQLClient
            .query({
                query: print(getProjects),
                variables: {
                    filter: {
                        projectId
                    }
                },
            })
            .then(({ projects }) => projects?.length ? projects[0] : undefined);
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
                mutation: print(deleteProject),
                variables: {
                    projectId,
                },
            })
            .then(() => undefined);
    }
}