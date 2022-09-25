export type MessageType = 'Mutation' | 'Metadata';


export class Message {
    constructor(public type: MessageType, public payload: any) {}

    static fromMutationPayload(json: any): Message {
        return new Message(json.Type, json.Payload)
    }
}
