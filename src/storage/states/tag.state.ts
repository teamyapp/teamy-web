export  class TagState {
    public constructor(
        public id: number,
        public tag: string,
    ) {}

    public static fromMutationPayload(json: any): TagState {
        return new TagState(
            json.ID,
            json.Tag,
        );
    }

    public static fromJson(json: any): TagState {
        return new TagState(
            json.id,
            json.tag,
        );
    }
}