import React, { Component, ReactNode } from 'react';

import { DragAndDropContainer } from '@lib/dragAndDrop/DragAndDropContainer';
import { DragAndDropController } from '@lib/dragAndDrop/DragAndDropController';
import { RelativeLayout } from '@lib/layout/relativeLayout';
import { SectionUI } from '@lib/ui/Section';

import { DragAndDropContext } from '@core/config/dragAndDrop';
import {
    draggableTask,
    sectionItemSizeTransformer,
} from '@core/config/draggable';
import { needAttentionSectionId } from '@core/config/sections';
import { Deps } from '@core/dep/deps';
import { UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';

import styles from './NeedAttentionSection.module.scss';
import { TaskListItem } from './TaskListItem';
import { ThirdPartyAppEventHub } from '@teamyapp/ext';

interface Props {
    deps: Deps;
    relativeLayout: RelativeLayout;
    dragAndDropController: DragAndDropController<DragAndDropContext>;
    needAttentionTask?: Task;
    currentClientId?: number;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
    onUpdateTask?: (taskId: number, task: UpdateTaskInput) => void;
    onStartTask?: (taskId: number) => void;
    onDeleteTask?: (taskId: number) => void;
    onCompleteTask?: (taskId: number) => void;
    onViewTaskDetail?: (taskId: number) => void;
    onReportTaskBlocked?: (taskId: number) => void;
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
                    context={{ isPersonal: true }}
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
                        deps={this.props.deps}
                        relativeLayout={this.props.relativeLayout}
                        dragAndDropController={this.props.dragAndDropController}
                        sectionId={sectionId}
                        task={task}
                        currentClientId={this.props.currentClientId}
                        thirdPartyAppEventHubs={this.props.thirdPartyAppEventHubs}
                        onUpdateTask={this.props.onUpdateTask}
                        onStartTask={this.props.onStartTask}
                        onDeleteTask={this.props.onDeleteTask}
                        onCompleteTask={this.props.onCompleteTask}
                        onViewTaskDetail={this.props.onViewTaskDetail}
                        onReportTaskBlocked={this.props.onReportTaskBlocked}
                    />
                </div>
            );
        };
    };
}
