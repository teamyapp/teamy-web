import { Attributes } from '@lib/storage/mutation';

class CompositeKey {
    constructor(public teamId: number, public userId: number) {}

    public toString(): string {
        return [this.teamId, this.userId].join(',');
    }

    public static parse(key: string): CompositeKey {
        const fields = key.split(',');
        return {
            teamId: parseInt(fields[0]),
            userId: parseInt(fields[1]),
        };
    }
}

export class TeamMemberState {
    private compositeKey: CompositeKey;

    constructor(public teamId: number, public userId: number) {
        this.compositeKey = new CompositeKey(this.teamId, this.userId);
    }

    get key(): string {
        return this.compositeKey.toString();
    }

    static parseCompositeKey(key: string): CompositeKey {
        return CompositeKey.parse(key);
    }

    static fromAttributes(attributes: Attributes): TeamMemberState {
        return new TeamMemberState(
            parseInt(attributes.TeamID),
            parseInt(attributes.UserID),
        );
    }

    public static fromJson(json: any): TeamMemberState {
        return new TeamMemberState(json.teamId, json.userId);
    }
}
