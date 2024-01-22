import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import React, { Component } from 'react';

import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { Draggable } from '@lib/dragAndDrop/Draggable';
import { RelativeLayout } from '@lib/layout/relativeLayout';

import { DragAndDropContext } from '@core/config/dragAndDrop';
import { draggableTask } from '@core/config/draggable';
import { Deps } from '@core/dep/deps';
import { UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';

import { InlineTaskUI } from '../InlineTask';

interface Props {
    deps: Deps;
    relativeLayout: RelativeLayout;
    dragAndDropController: DragAndDropController<DragAndDropContext>;
    sectionId: string;
    task: Task;
    currentClientId?: number;
    filterTaskAction?: (action: TaskAction) => boolean;
    numActionColumns?: number;
    showStatus?: boolean;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
}

export class TaskListItem extends Component<Props> {
    public render() {
        return (
            <Draggable
                dragAndDropController={this.props.dragAndDropController}
                containerId={this.props.sectionId}
                itemType={draggableTask}
                data={this.props.task}
            >
                <InlineTaskUI
                    deps={this.props.deps}
                    relativeLayout={this.props.relativeLayout}
                    task={this.props.task}
                    currentClientId={this.props.currentClientId}
                    filterTaskAction={this.props.filterTaskAction}
                    numActionColumns={this.props.numActionColumns}
                    showStatus={this.props.showStatus}
                    thirdPartyAppEventHubs={this.props.thirdPartyAppEventHubs}
                    onUpdateTask={this.props.onUpdateTask}
                    onStartTask={this.props.onStartTask}
                    onDeleteTask={this.props.onDeleteTask}
                    onCompleteTask={this.props.onCompleteTask}
                    onViewTaskDetail={this.props.onViewTaskDetail}
                    onReportTaskBlocked={this.props.onReportTaskBlocked}
                    onStartEditingTask={this.onStartEditingTask}
                    onFinishEditingTask={this.onFinishEditingTask}
                />
            </Draggable>
        );
    }

    private onStartEditingTask = () => {
        this.props.dragAndDropController.turnOffDragging(draggableTask);
    };

    private onFinishEditingTask = () => {
        this.props.dragAndDropController.turnOnDragging(draggableTask);
    };
}
