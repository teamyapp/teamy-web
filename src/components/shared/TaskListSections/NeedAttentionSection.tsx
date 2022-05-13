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
import { Task } from '@core/entity/task';

import styles from './NeedAttentionSection.module.scss';
import { TaskListItem } from './TaskListItem';

interface Props {
    dragAndDropController: DragAndDropController;
    needAttentionTask?: Task;
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
                            this.renderTask(needAttentionSectionId)(
                                this.props.needAttentionTask,
                            )}
                    </SectionUI>
                </DragAndDropContainer>
            </div>
        );
    }

    private renderTask = (sectionId: string): ((task: Task) => ReactNode) => {
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
