import React, { Component, ReactNode } from 'react';

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
import { UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';

import styles from './DeliveredSection.module.scss';
import { TaskListItem } from './TaskListItem';

interface Props {
    dragAndDropController: DragAndDropController;
    tasks: Task[];
    selectOwnerTaskId?: number;
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
                                this.renderInlineTask(deliveredSectionId),
                            )}
                        </div>
                    </SectionUI>
                </DragAndDropContainer>
            </div>
        );
    }

    private renderInlineTask = (
        sectionId: string,
    ): ((task: Task) => ReactNode) => {
        return (task: Task) => {
            return (
                <div key={task.id}>
                    <TaskListItem
                        dragAndDropController={this.props.dragAndDropController}
                        sectionId={sectionId}
                        task={task}
                        isSelectingOwner={
                            this.props.selectOwnerTaskId === task.id
                        }
                        onUpdateTask={this.props.onUpdateTask}
                        onStartTask={this.props.onStartTask}
                        onDeleteTask={this.props.onDeleteTask}
                        onCompleteTask={this.props.onCompleteTask}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.props.onReportTaskBlocked}
                        onShowPotentialTaskOwners={
                            this.props.onShowPotentialTaskOwners
                        }
                    />
                </div>
            );
        };
    };
}
