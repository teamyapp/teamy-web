import React, { Component, ReactElement } from 'react';

import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { SectionUI } from '@lib/ui/Section';
import { SpacerUI } from '@lib/ui/Spacer';
import { BoundingBoxFinder } from '@lib/ui/position';

import {
    draggableTask,
    sectionItemSizeTransformer,
} from '@core/config/draggable';
import { deliveredSectionId } from '@core/config/sections';
import { Task } from '@core/entity/task';

import styles from './DeliveredSection.module.scss';
import { TaskListItem } from './TaskListItem';

interface Props {
    dragAndDropController: DragAndDropController;
    tasks: Task[];
    taskSelectingOwner?: Task;
    onUpdateTask?: (task: Task) => void;
    onViewTaskDetailClick?: (taskId: string) => void;
    onDeleteTaskClick?: (taskId: string) => void;
    onStartTaskClick?: (taskId: string) => void;
    onCompleteTaskClick?: (taskId: string) => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: BoundingBoxFinder,
    ) => void;
}

export class DeliveredSection extends Component<Props> {
    public render() {
        return (
            <div className={`${styles.TaskListSection}`}>
                <DragAndDropContainer
                    dragAndDropController={this.props.dragAndDropController}
                    containerId={deliveredSectionId}
                    itemType={draggableTask}
                    itemSizeTransformer={sectionItemSizeTransformer}
                >
                    <SectionUI
                        title={'Delivered'}
                        actions={
                            <div className={`${styles.SectionTopBar}`}>
                                <div className={styles.TaskCounter}>
                                    {this.props.tasks.length}
                                </div>
                                <SpacerUI />
                            </div>
                        }
                    >
                        <div className={styles.TaskList}>
                            {this.props.tasks.map(
                                this.renderTask(deliveredSectionId),
                            )}
                        </div>
                    </SectionUI>
                </DragAndDropContainer>
            </div>
        );
    }

    private renderTask = (
        sectionId: string,
    ): ((task: Task) => ReactElement) => {
        return (task: Task) => {
            return (
                <div key={task.id}>
                    <TaskListItem
                        dragAndDropController={this.props.dragAndDropController}
                        task={task}
                        sectionId={sectionId}
                        isEditing={false}
                        canViewDetail={true}
                        taskSelectingOwner={this.props.taskSelectingOwner}
                        onTaskFinishEditing={this.props.onUpdateTask}
                        onViewTaskDetailClick={this.props.onViewTaskDetailClick}
                        onDeleteTaskClick={this.props.onDeleteTaskClick}
                        onStartTaskClick={this.props.onStartTaskClick}
                        onCompleteTaskClick={this.props.onCompleteTaskClick}
                        onShowPotentialTaskOwners={
                            this.props.onShowPotentialTaskOwners
                        }
                    />
                </div>
            );
        };
    };
}
