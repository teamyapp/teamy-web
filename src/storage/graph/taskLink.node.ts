import { TaskLink } from '@core/entity/taskLink';

import { TaskLinkState } from '../states/taskLink.state';

export class TaskLinkNode implements TaskLink {
    constructor(private taskLinkState: TaskLinkState) {}

    public get id(): number {
        return this.taskLinkState.id;
    }

    public get taskId(): number {
        return this.taskLinkState.taskId;
    }

    public get title(): string {
        return this.taskLinkState.title;
    }

    public get url(): string {
        return this.taskLinkState.url;
    }

    public get iconUrl(): string | undefined {
        return this.taskLinkState.iconUrl;
    }

    public get iconHoverUrl(): string | undefined {
        return this.taskLinkState.iconHoverUrl;
    }
}
