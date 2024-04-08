import { GraphQLClient } from "@lib/network/GraphQL.client";
import { RemoteCreateStoryInput, RemoteUpdateStoryInput } from "./entity/input";
import  createStory  from "./graphql/mutation/createStory.graphql";
import  updateStory  from "./graphql/mutation/updateStory.graphql";
import deleteStory  from "./graphql/mutation/deleteStory.graphql";
import addStoryToPhase  from "./graphql/mutation/addStoryToPhase.graphql";
import addStoriesToPhase from "./graphql/mutation/addStoriesToPhase.graphql";
import getStories from "./graphql/query/getStories.graphql";
import removeStoryFromPhase  from "./graphql/mutation/removeStoryFromPhase.graphql";
import removeStoriesFromPhase from "./graphql/mutation/removeStoriesFromPhase.graphql";
import { print } from "graphql";
import { RemoteStory } from "./entity/remoteStory";
import { RemotePhase } from "./entity/remotePhase";

export class StoryClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }
    
    getStory(storyId: string): Promise<RemoteStory | undefined> {
        return this.graphQLClient
            .query({
                query: print(getStories),
                variables: {
                    filter: {
                        storyId
                    }
                },
            })
            .then(({ stories }) => stories?.length ? stories[0] : undefined);
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

    addStoryToPhase(phaseId: string, storyId: string): Promise<RemotePhase> {
        return this.graphQLClient
            .mutate({
                mutation: print(addStoryToPhase),
                variables: {
                    phaseId,
                    storyId,
                },
            })
            .then(({addStoryToPhase}) => addStoryToPhase);
    }

    addStoriesToPhase(
        phaseId: string,
        storyIds: string[],
    ): Promise<RemotePhase> {
        return this.graphQLClient
            .mutate({
                mutation: print(addStoriesToPhase),
                variables: {
                    phaseId,
                    storyIds,
                },
            })
            .then(({addStoriesToPhase}) => addStoriesToPhase);
    }

    removeStoryFromPhase(phaseId: string, storyId: string): Promise<RemotePhase> {
        return this.graphQLClient
            .mutate({
                mutation: print(removeStoryFromPhase),
                variables: {
                    phaseId,
                    storyId,
                },
            })
            .then(({removeStoryFromPhase}) => removeStoryFromPhase);
    }

    removeStoriesFromPhase(
        phaseId: string,
        storyIds: string[],
    ): Promise<RemotePhase> {
        return this.graphQLClient
            .mutate({
                mutation: print(removeStoriesFromPhase),
                variables: {
                    phaseId,
                    storyIds,
                },
            })
            .then(({removeStoriesFromPhase}) => removeStoriesFromPhase);
    }
}