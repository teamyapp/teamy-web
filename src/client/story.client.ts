import { GraphQLClient } from "@lib/network/GraphQL.client";
import { RemoteCreateStoryInput, RemoteUpdateStoryInput } from "./entity/input";
import  createStory  from "./graphql/mutation/createStory.graphql";
import  updateStory  from "./graphql/mutation/updateStory.graphql";
import deleteStory  from "./graphql/mutation/deleteStory.graphql";
import addStoryToPhase  from "./graphql/mutation/addStoryToPhase.graphql";
import removeStoryFromPhase  from "./graphql/mutation/removeStoryFromPhase.graphql";
import { print } from "graphql";
import { RemoteStory } from "./entity/remoteStory";
import { RemotePhase } from "./entity/remotePhase";

export class StoryClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    createStory(projectId: string, input: RemoteCreateStoryInput): Promise<RemoteStory> {
        return this.graphQLClient
            .mutate({
                mutation: print(createStory),
                variables: {
                    projectId,
                    input,
                },
            })
            .then(({ createStory }) => createStory);
    }

    updateStory(storyId: string, input: RemoteUpdateStoryInput): Promise<RemoteStory> {
        return this.graphQLClient
            .mutate({
                mutation: print(updateStory),
                variables: {
                    storyId,
                    input,
                },
            })
            .then(({ updateStory }) => updateStory);
    }

    deleteStory(storyId: string): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: print(deleteStory),
                variables: {
                    storyId,
                },
            })
            .then(() => undefined);
    }

    addStoryToPhase(storyId: string, phaseId: string): Promise<RemotePhase> {
        return this.graphQLClient
            .mutate({
                mutation: print(addStoryToPhase),
                variables: {
                    storyId,
                    phaseId,
                },
            })
            .then(({addStoryToPhase}) => addStoryToPhase);
    }

    removeStoryFromPhase(storyId: string, phaseId: string): Promise<RemotePhase> {
        return this.graphQLClient
            .mutate({
                mutation: print(removeStoryFromPhase),
                variables: {
                    storyId,
                    phaseId,
                },
            })
            .then(({removeStoryFromPhase}) => removeStoryFromPhase);
    }
}