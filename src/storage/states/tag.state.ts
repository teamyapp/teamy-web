export class TagState {
    public constructor(public id: number, public value: string) {}

    public static fromMutationPayload(json: any): TagState {
        return new TagState(json.ID, json.Value);
    }

    public static fromJson(json: any): TagState {
        return new TagState(json.id, json.value);
    }
}
