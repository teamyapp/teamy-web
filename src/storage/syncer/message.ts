import { Metadata } from "./metadata";
import { Mutation } from "./mutation";

export type MessageType = 'Mutation' | 'Metadata';
export type MessageEvent = Mutation | Metadata

export class Message {
    static fromMutationPayload(json: any): MessageEvent {
        if (json.Type === 'Mutation') {
            return Mutation.fromMutationPayload(json.Payload)
        } else {
            return Metadata.fromMutationPayload(json.Payload)
        }
    }
}
