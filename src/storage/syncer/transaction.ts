import { Mutation } from "./mutation";

export class Transaction {
    private constructor(
        public mutations: Mutation[],
        public id: number,
    ) {}

    static fromTransactionPayload(json: any): Transaction {
        return new Transaction(
            json.Mutations,
            json.ID,
        );
    }
}
