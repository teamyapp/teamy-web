export class ClientState {
    public constructor(
        public id: number,
        public userId: number,
    ) {}

    public static fromMutationPayload(json: any): ClientState {
        return new ClientState(
            json.ID,
            json.UserID,
        );
    }

    public static fromJson(json: any): ClientState {
        return new ClientState(
            json.id,
            json.userId,
        )
    }
}
