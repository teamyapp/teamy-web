export class DragTaskActivity {
    public constructor(
        public isDragging: boolean,
        public dragByUserId: number,
        public draggingClientId: number,
    ) {}

    public static fromMutationPayload(json: any): DragTaskActivity {
        return new DragTaskActivity(
            json.IsDragging,
            json.DragByUserID,
            json.DraggingClientID
        );
    }

    public static fromJson(json: any): DragTaskActivity {
        return new DragTaskActivity(
            json.isDragging,
            json.dragByUserId,
            json.draggingClientId
        )
    }
}
