import { MutationType } from './mutationType';

export type Attributes = { [key: string]: string };

export class Mutation {
    constructor(
        public collectionType: string,
        public mutationType: MutationType,
        public attributes: Attributes,
    ) {}

    static fromJson(json: any): Mutation {
        return new Mutation(
            json.CollectionType,
            json.MutationType,
            json.Attributes,
        );
    }
}
