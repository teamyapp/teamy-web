type ActivatorType = 'TIME_RANGE' | 'MAX_VIEWERS' | 'PERCENTAGE' | 'STATIC';

export class ActivatorState {
    constructor(
        public id: number,
        public type: ActivatorType,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): ActivatorState {
        return new ActivatorState(
            json.ID,
            json.Type,
            new Date(json.CreatedAt),
            new Date(json.UpdatedAt),
        );
    }

    public static fromJson(json: any): ActivatorState {
        return new ActivatorState(
            json.id,
            json.type,
            new Date(json.createdAt),
            new Date(json.updatedAt),
        );
    }
}

export class TimeRangeActivatorState {
    constructor(
        public startAt?: Date,
        public endAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): TimeRangeActivatorState {
        return new TimeRangeActivatorState(
            new Date(json.StartAt),
            new Date(json.EndAt),
        );
    }

    public static fromJson(json: any): TimeRangeActivatorState {
        return new TimeRangeActivatorState(
            new Date(json.startAt),
            new Date(json.endAt),
        );
    }
}

export class MaxViewersActivatorState {
    constructor(public maxViewers: number) {}

    public static fromMutationPayload(json: any): MaxViewersActivatorState {
        return new MaxViewersActivatorState(json.MaxViewers);
    }

    public static fromJson(json: any): MaxViewersActivatorState {
        return new MaxViewersActivatorState(json.maxViewers);
    }
}

export class PercentageActivatorState {
    constructor(public percentage: number) {}

    public static fromMutationPayload(json: any): PercentageActivatorState {
        return new PercentageActivatorState(json.Percentage);
    }

    public static fromJson(json: any): PercentageActivatorState {
        return new PercentageActivatorState(json.percentage);
    }
}
