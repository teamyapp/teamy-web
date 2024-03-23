import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import { InlineCreateTaskUI } from 'components/internal/InlineCreateTask';
import { TaskListItem } from 'components/internal/TaskListSections/TaskListItem';
import { useEffect, useRef, useState } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { backlogSectionId } from '@core/config/sections';
import { unplanned } from '@core/data/task.filter';
import { orderByStatusUrgencyAsc } from '@core/data/task.order';
import { Deps } from '@core/dep/deps';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { Phase } from '@core/entity/phase';
import { Project } from '@core/entity/project';
import { Story } from '@core/entity/story';
import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';

import styles from './Story.component.module.scss';

interface Props {
    deps: Deps;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
    numActionColumns: number;
    project: Project;
    story: Story;
    phase?: Phase;
    onViewTaskDetail: (taskId: number) => void;
}

export function StoryComponent(props: Props) {
    const [onEditingNewTaskInBacklog, setOnEditingNewTaskInBacklog] =
        useState(false);
    const [onEditingNewTaskInStory, setOnEditingNewTaskInStory] =
        useState(false);

    const currentClientId = props.deps.localStore.getState().currClientId;
    const unplannedTasksRef = useRef<Task[]>([]);
    const [unplannedTasks, setUnplannedTasks] = useState<Task[]>([]);

    useEffect(() => {
        const stateChangeChan = props.deps.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('[PlanningComponent] waiting for state changes');
                const hasChanged = await stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                if (unplannedTasksRef.current) {
                    let tasks =
                        props.deps.graphSource.currentTeam()?.tasks || [];
                    tasks = tasks
                        .filter(unplanned)
                        .sort(orderByStatusUrgencyAsc);
                    setUnplannedTasks(tasks);
                    unplannedTasksRef.current = tasks;
                }
            }
        })().then();

        return () => {
            stateChangeChan?.close();
        };
    }, []);

    const onUpdateTask = async (taskId: number, task: UpdateTaskInput) => {
        await props.deps.stateSyncer.updateTask(taskId, task);
        await props.deps.feedbackPubSub.publish({
            type: 'TaskUpdated',
            taskId: taskId,
        });
    };

    const onDeleteTask = async (taskId: number) => {
        props.deps.stateSyncer.deleteTask(taskId);
    };

    const onAddTaskInBacklogClick = () => {
        setOnEditingNewTaskInBacklog(true);
    };

    const onAddTaskInStoryClick = () => {
        setOnEditingNewTaskInStory(true);
    };

    const onCreateTaskInBacklog = (task: CreateTaskInput) => {
        props.deps.stateSyncer.createTask(
            props.deps.localStore.getState().currTeamId!,
            task,
        );
        setOnEditingNewTaskInBacklog(false);
    };

    const onCreateTaskInStory = (task: CreateTaskInput) => {
        props.deps.stateSyncer.createTask(
            props.deps.localStore.getState().currTeamId!,
            task,
        );
        setOnEditingNewTaskInStory(false);
    };

    const onDiscardNewTaskInBacklog = () => {
        setOnEditingNewTaskInBacklog(false);
    };

    const onDiscardNewTaskInStory = () => {
        setOnEditingNewTaskInStory(false);
    };

    return (
        <div className={styles.Story}>
            <div className={styles.StoryDetailSection}>
                <div className={styles.Header}>
                    <div className={styles.Information}>
                        {props.story.name}
                        <div className={styles.Description}>
                            {props.story.completedTasks} of{' '}
                            {props.story.totalTasks} tasks completed
                        </div>
                    </div>

                    <div className={styles.Actions}>
                        <div
                            className={styles.Add}
                            onClick={onAddTaskInStoryClick}
                        >
                            <ButtonUI label='Add' />
                        </div>
                        <div className={styles.Delete}>
                            <ButtonUI label='Delete' />
                        </div>
                    </div>
                </div>
                <div className={styles.TasksSection}>
                    {onEditingNewTaskInStory && (
                        <InlineCreateTaskUI
                            deps={props.deps}
                            onCreateTask={onCreateTaskInStory}
                            onDiscardNewTask={onDiscardNewTaskInStory}
                        />
                    )}
                    {props.story.tasks.map((task) => (
                        <div key={task.id} className={styles.InlineTask}>
                            <TaskListItem
                                deps={props.deps}
                                relativeLayout={props.deps.relativeLayout}
                                task={task}
                                currentClientId={currentClientId}
                                filterTaskAction={filterTaskAction}
                                numActionColumns={props.numActionColumns}
                                showStatus={true}
                                thirdPartyAppEventHubs={
                                    props.thirdPartyAppEventHubs
                                }
                                sectionId='StoryDetail'
                                onUpdateTask={onUpdateTask}
                                onDeleteTask={onDeleteTask}
                                onViewTaskDetail={props.onViewTaskDetail}
                                dragAndDropController={
                                    props.deps.dragAndDropController
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.TaskListSection}>
                <div className={styles.TopBar}>
                    <div className={styles.Title}>Tasks</div>
                    <div
                        className={styles.Add}
                        onClick={onAddTaskInBacklogClick}
                    >
                        <MaterialIconUI>add</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.TaskList}>
                    {onEditingNewTaskInBacklog && (
                        <InlineCreateTaskUI
                            deps={props.deps}
                            onCreateTask={onCreateTaskInBacklog}
                            onDiscardNewTask={onDiscardNewTaskInBacklog}
                        />
                    )}
                    {unplannedTasks.map((task) => (
                        <div className={styles.ListItem} key={task.id}>
                            <TaskListItem
                                deps={props.deps}
                                relativeLayout={props.deps.relativeLayout}
                                sectionId={backlogSectionId}
                                dragAndDropController={
                                    props.deps.dragAndDropController
                                }
                                currentClientId={currentClientId}
                                task={task}
                                numActionColumns={1}
                                showStatus={true}
                                filterTaskAction={filterTaskAction}
                                thirdPartyAppEventHubs={
                                    props.thirdPartyAppEventHubs
                                }
                                onUpdateTask={onUpdateTask}
                                onDeleteTask={onDeleteTask}
                                onViewTaskDetail={props.onViewTaskDetail}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const planningTaskActions: TaskAction[] = [
    'DELETE',
    'ASSIGN_OWNER',
    'VIEW_DETAIL',
];

function filterTaskAction(action: TaskAction): boolean {
    return planningTaskActions.includes(action);
}