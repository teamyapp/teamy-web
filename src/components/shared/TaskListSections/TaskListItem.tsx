import React, { Component } from 'react';

import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { Draggable } from '@lib/dragAndDrop/Draggable';
import { BoundingBoxFinder } from '@lib/ui/position';

import { draggableTask } from '@core/config/draggable';
import { UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';

import { InlineTaskUI } from '../InlineTask';

interface Props {
    dragAndDropController: DragAndDropController;
    sectionId: string;
    task: Task;
    isSelectingOwner: boolean;
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
    onShowPotentialTaskOwners?: (
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => void;
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
                    task={this.props.task}
                    isSelectingOwner={this.props.isSelectingOwner}
                    onUpdateTask={this.props.onUpdateTask}
                    onStartTask={this.props.onStartTask}
                    onDeleteTask={this.props.onDeleteTask}
                    onCompleteTask={this.props.onCompleteTask}
                    onViewTaskDetail={this.props.onViewTaskDetail}
                    onReportTaskBlocked={this.props.onReportTaskBlocked}
                    onShowPotentialTaskOwners={
                        this.props.onShowPotentialTaskOwners
                    }
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
