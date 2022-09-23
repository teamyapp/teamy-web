export class Metadata {
    private constructor(
        public clientId: string,
    ) {}

    static fromMutationPayload(json: any): Metadata {
        return new Metadata(
            json.ClientID,
        );
    }
}
