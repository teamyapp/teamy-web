export type CollectionType =
    | 'Task'
    | 'Invitation'
    | 'Message'
    | 'Team'
    | 'User'
    | 'Thread'
    | 'TeamMember'
    | 'TaskAwaitForRelation'
    | 'SprintTaskRelation';

export type MutationType = 'Create' | 'Update' | 'Delete';

export class Mutation {
    private constructor(
        public collectionType: CollectionType,
        public mutationType: MutationType,
        public payload: any,
    ) {}

    static fromMutationPayload(json: any): Mutation {
        return new Mutation(
            json.CollectionType,
            json.MutationType,
            json.Payload,
        );
    }
}
