import { GraphQLClient } from "@lib/network/GraphQL.client";
import { RemoteCreatePhaseInput, RemoteUpdatePhaseInput } from "./entity/input";
import  createPhase  from "./graphql/mutation/createPhase.graphql";
import  updatePhase  from "./graphql/mutation/updatePhase.graphql";
import deletePhase  from "./graphql/mutation/deletePhase.graphql";
import getPhases from "./graphql/query/getPhases.graphql";
import { print } from "graphql";
import { RemotePhase } from "./entity/remotePhase";

export class PhaseClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    getPhase(phaseId: string): Promise<RemotePhase | undefined> {
        return this.graphQLClient
            .query({
                query: print(getPhases),
                variables: {
                    filter: {
                        phaseId
                    }
                },
            })
            .then(({ phases }) => phases?.length ? phases[0] : undefined);
    }

    createPhase(projectId: string, input: RemoteCreatePhaseInput): Promise<RemotePhase> {
        return this.graphQLClient
            .mutate({
                mutation: print(createPhase),
                variables: {
                    projectId,
                    input,
                },
            })
            .then(({ createPhase }) => createPhase);
    }

    updatePhase(phaseId: string, input: RemoteUpdatePhaseInput): Promise<RemotePhase> {
        return this.graphQLClient
            .mutate({
                mutation: print(updatePhase),
                variables: {
                    phaseId,
                    input,
                },
            })
            .then(({ updatePhase }) => updatePhase);
    }

    deletePhase(phaseId: string): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: print(deletePhase),
                variables: {
                    phaseId,
                },
            })
            .then(() => undefined);
    }
}