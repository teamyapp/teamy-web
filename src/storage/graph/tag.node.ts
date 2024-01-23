import { Tag } from "@core/entity/tag";
import { LocalStore } from "../syncer/localStore";
import { TagState } from "../states/tag.state";


export class TagNode implements Tag {
    constructor(private localStore: LocalStore, private _tag: TagState) {}

    public get id(): number {
        return this._tag.id;
    }

    public get tag(): string {
        return this._tag.tag;
    }
}