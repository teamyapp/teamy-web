import { Tag } from '@core/entity/tag';

import { TagState } from '../states/tag.state';
import { LocalStore } from '../syncer/localStore';

export class TagNode implements Tag {
    constructor(private localStore: LocalStore, private tag: TagState) {}

    public get id(): number {
        return this.tag.id;
    }

    public get value(): string {
        return this.tag.value;
    }
}
