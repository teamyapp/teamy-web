import React, { Component, ReactNode } from 'react';

import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { RelativeLayout } from '@lib/layout/relativeLayout';
import { SectionUI } from '@lib/ui/Section';
import { SpacerUI } from '@lib/ui/Spacer';
import { BoundingBoxFinder } from '@lib/ui/position';

import { DragAndDropContext } from '@core/config/dragAndDrop';
import {
    draggableTask,
    sectionItemSizeTransformer,
} from '@core/config/draggable';
import { deliveredSectionId } from '@core/config/sections';
import { groupByOwners } from '@core/data/task.group';
import { UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';

import styles from './DeliveredSection.module.scss';
import { TaskListItem } from './TaskListItem';

interface Props {
    relativeLayout: RelativeLayout;
    dragAndDropController: DragAndDropController<DragAndDropContext>;
    tasks: Task[];
    selectOwnerTaskId?: number;
    currentClientId?: number;
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
        const groupedTasks = groupByOwners(this.props.tasks);
        const flattenTasks = Array.from(groupedTasks.values()).flat();
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
                                    {flattenTasks.length}
                                </div>
                                <SpacerUI />
                            </div>
                        }
                    >
                        <div className={styles.TaskList}>
                            {flattenTasks.map(
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
                        relativeLayout={this.props.relativeLayout}
                        dragAndDropController={this.props.dragAndDropController}
                        sectionId={sectionId}
                        task={task}
                        isSelectingOwner={
                            this.props.selectOwnerTaskId === task.id
                        }
                        currentClientId={this.props.currentClientId}
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
