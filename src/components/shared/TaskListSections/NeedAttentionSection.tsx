import React, { Component, ReactNode } from 'react';

import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { SectionUI } from '@lib/ui/Section';
import { BoundingBoxFinder } from '@lib/ui/position';

import {
    draggableTask,
    sectionItemSizeTransformer,
} from '@core/config/draggable';
import { needAttentionSectionId } from '@core/config/sections';
import { UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';

import styles from './NeedAttentionSection.module.scss';
import { TaskListItem } from './TaskListItem';

interface Props {
    dragAndDropController: DragAndDropController;
    needAttentionTask?: Task;
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

export class NeedAttentionSection extends Component<Props> {
    public render() {
        return (
            <div className={styles.TaskListSection}>
                <DragAndDropContainer
                    dragAndDropController={this.props.dragAndDropController}
                    containerId={needAttentionSectionId}
                    itemType={draggableTask}
                    itemSizeTransformer={sectionItemSizeTransformer}
                >
                    <SectionUI title={'Need Attention'}>
                        {this.props.needAttentionTask &&
                            this.renderInlineTask(needAttentionSectionId)(
                                this.props.needAttentionTask,
                            )}
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
