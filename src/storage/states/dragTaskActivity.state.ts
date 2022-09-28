export class DragTaskActivityState {
    public constructor(
        public isDragging: boolean,
        public clientId: number
    ) {}

    public static fromMutationPayload(json: any): DragTaskActivityState {
        return new DragTaskActivityState(
            json.IsDragging,
            json.Client.ID
        );
    }

    public static fromJson(json: any): DragTaskActivityState {
        return new DragTaskActivityState(
            json.isDragging,
            json.client.id
        )
    }
}
