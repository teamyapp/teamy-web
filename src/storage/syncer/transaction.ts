import { Mutation } from "./mutation";

export class Transaction {
    private constructor(
        public id: number,
        public mutations: Mutation[],
    ) {}

    static fromTransactionPayload(json: any): Transaction {
        return new Transaction(
            json.ID,
            json.Mutations.map(Mutation.fromMutationPayload),
        );
    }
}
