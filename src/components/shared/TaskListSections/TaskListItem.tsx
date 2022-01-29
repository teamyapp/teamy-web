import React, { Component } from 'react';

import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { Draggable } from '@lib/dragAndDrop/Draggable';
import { BoundingBoxFinder } from '@lib/ui/position';

import { draggableTask } from '@core/config/draggable';
import { Task } from '@core/entity/task';

import { TaskPreviewUI } from '../TaskPreview';

interface Props {
    dragAndDropController: DragAndDropController;
    task: Task;
    sectionId: string;
    isEditing: boolean;
    showPastDue?: boolean;
    canViewDetail: boolean;
    taskSelectingOwner?: Task;
    onTaskFinishEditing?: (task: Task) => void;
    onViewTaskDetailClick?: (taskId: string) => void;
    onDeleteTaskClick?: (taskId: string) => void;
    onStartTaskClick?: (taskId: string) => void;
    onCompleteTaskClick?: (taskId: string) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: BoundingBoxFinder,
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
                <TaskPreviewUI
                    canViewDetail={this.props.canViewDetail}
                    task={this.props.task}
                    isEditing={this.props.isEditing}
                    isOwnerSelected={
                        this.props.taskSelectingOwner?.id === this.props.task.id
                    }
                    showPastDue={this.props.showPastDue === undefined}
                    onTaskDetailClick={this.props.onViewTaskDetailClick}
                    onTaskStartEditing={this.onTaskStartEditing}
                    onTaskFinishEditing={this.taskFinishEditing}
                    onDeleteTaskClick={this.props.onDeleteTaskClick}
                    onStartTaskClick={this.props.onStartTaskClick}
                    onCompleteTaskClick={this.props.onCompleteTaskClick}
                    onShowPotentialTaskOwners={
                        this.props.onShowPotentialTaskOwners
                    }
                />
            </Draggable>
        );
    }

    private onTaskStartEditing = () => {
        this.props.dragAndDropController.turnOffDragging(draggableTask);
    };

    private taskFinishEditing = (task: Task) => {
        this.props.dragAndDropController.turnOnDragging(draggableTask);
        this.props.onTaskFinishEditing?.call(null, task);
    };
}
