import { AttributeMatcher } from './attributeMatcher';
import { MutationType } from './mutationType';

export class Subscription {
    constructor(
        public collectionType: string,
        public mutationType: MutationType,
        public attributeMatchers: AttributeMatcher[],
    ) {}

    toJson(): any {
        return {
            CollectionType: this.collectionType,
            MutationType: this.mutationType,
            AttributeMatchers: this.attributeMatchers?.map((attributeMatcher) =>
                attributeMatcher.toJson(),
            ),
        };
    }

    static fromJson(json: any): Subscription {
        return new Subscription(
            json.CollectionType,
            json.mutationType,
            json.attributeMatchers?.map((attributeMatcherJson: any) =>
                AttributeMatcher.fromJson(attributeMatcherJson),
            ),
        );
    }
}
