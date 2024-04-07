import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import { InlineCreateTaskUI } from 'components/internal/InlineCreateTask';
import { TaskListItem } from 'components/internal/TaskListSections/TaskListItem';
import { useEffect, useRef, useState } from 'react';

import { ItemsSelector } from '@lib/collections/itemSelector';
import { getPlatform } from '@lib/runtime/os';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { backlogSectionId } from '@core/config/sections';
import { isPlanned, unplanned } from '@core/data/task.filter';
import { orderByStatusUrgencyAsc } from '@core/data/task.order';
import { Deps } from '@core/dep/deps';
import { CreateTaskInput, UpdateTaskInput } from '@core/entity/input';
import { Story } from '@core/entity/story';
import { Task } from '@core/entity/task';
import { TaskAction } from '@core/entity/taskAction';

import styles from './Story.component.module.scss';

type backlogTasksFilterKey = 'IS_PLANNED' | 'UNPLANNED' | 'ALL';
const backlogTasksFilterOptions: Option[] = [
    {
        key: 'ALL',
        description: 'All',
    },
    {
        key: 'IS_PLANNED',
        description: 'Planned',
    },
    {
        key: 'UNPLANNED',
        description: 'Unplanned',
    },
];
interface Props {
    deps: Deps;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
    numActionColumns: number;
    storyId: number;
    onViewTaskDetail: (taskId: number) => void;
}

export function StoryComponent(props: Props) {
    const [onEditingNewTaskInBacklog, setOnEditingNewTaskInBacklog] =
        useState(false);
    const [onEditingNewTaskInStory, setOnEditingNewTaskInStory] =
        useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentClientId, setCurrentClientId] = useState<number>();
    const [selectBacklogTaskIds, setSelectBacklogTaskIds] = useState<
        Set<string>
    >(new Set());
    const [selectedBacklogTasksFilter, setSelectedBacklogTasksFilter] =
        useState<backlogTasksFilterOption>('ALL');
    const [selectStoryTaskIds, setSelectStoryTaskIds] = useState<Set<string>>(
        new Set(),
    );
    const selectBacklogTaskIdsRef = useRef(selectBacklogTaskIds);
    const selectStoryTaskIdsRef = useRef(selectStoryTaskIds);
    const ctrlKeyPressedRef = useRef(false);
    const backlogTaskSelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectBacklogTaskIds),
    );

    const storyTaskSelectorRef = useRef<ItemsSelector>(
        new ItemsSelector(ctrlKeyPressedRef.current, selectStoryTaskIds),
    );
    const [story, setStory] = useState<Story>();

    useEffect(() => {
        const selectedBacklogTaskChan =
            backlogTaskSelectorRef.current.subscribeSelectedItemsChanged();
        const selectedStoryTaskChan =
            storyTaskSelectorRef.current.subscribeSelectedItemsChanged();
        const keyBoardEventChan = props.deps.keyBoardEventMonitor.subscribe();

        const stateChangeChan = props.deps.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('[StoryComponent] waiting for state changes');
                const hasChanged = await stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                const currentTeam = props.deps.graphSource.currentTeam();
                if (currentTeam?.tasks.length) {
                    setTasks(currentTeam.tasks);
                }

                const currentClientId =
                    props.deps.localStore.getState().currClientId;
                if (currentClientId !== undefined) {
                    setCurrentClientId(currentClientId);
                }

                const story = props.deps.graphSource.story(props.storyId);
                if (story) {
                    setStory(story);
                }
            }
        })();

        (async () => {
            while (true) {
                const selectedBacklogTaskIds =
                    await selectedBacklogTaskChan.pop();
                if (selectedBacklogTaskIds === undefined) {
                    return;
                }

                if (
                    selectedBacklogTaskIds.size > 0 &&
                    selectStoryTaskIdsRef.current.size > 0
                ) {
                    await storyTaskSelectorRef.current.reset();
                }

                const updatedSelectedPhases = new Set(selectedBacklogTaskIds);
                setSelectBacklogTaskIds(updatedSelectedPhases);
                selectBacklogTaskIdsRef.current = updatedSelectedPhases;
            }
        })();

        (async () => {
            while (true) {
                const selectedStoryTaskIds = await selectedStoryTaskChan.pop();
                if (selectedStoryTaskIds === undefined) {
                    return;
                }

                if (
                    selectedStoryTaskIds.size > 0 &&
                    selectBacklogTaskIdsRef.current.size > 0
                ) {
                    await backlogTaskSelectorRef.current.reset();
                }

                const updatedSelectedPhases = new Set(selectedStoryTaskIds);
                setSelectStoryTaskIds(updatedSelectedPhases);
                selectStoryTaskIdsRef.current = updatedSelectedPhases;
            }
        })();

        (async () => {
            while (true) {
                console.log(`[StoryComponent] waiting for keyboard event`);
                const keyboardEvent = await keyBoardEventChan.pop();
                if (keyboardEvent === undefined) {
                    return;
                }

                const { key, eventType } = keyboardEvent;
                const platform = getPlatform();
                if (
                    (platform === 'Mac' && key === 'Meta') ||
                    (platform === 'Windows' && key === 'Control')
                ) {
                    if (['keydown', 'keyup'].includes(eventType)) {
                        const isKeyPressed = eventType === 'keydown';
                        ctrlKeyPressedRef.current = isKeyPressed;
                        backlogTaskSelectorRef.current.setMultiSelectionEnabled(
                            isKeyPressed,
                        );
                        storyTaskSelectorRef.current.setMultiSelectionEnabled(
                            isKeyPressed,
                        );
                    }
                }
            }
        })();

        return () => {
            storyTaskSelectorRef.current.dispose();
            backlogTaskSelectorRef.current.dispose();
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

    const onAddTaskToStoryClick = () => {
        setOnEditingNewTaskInStory(true);
    };

    const onDeleteTasksFromStoryClick = () => {
        selectStoryTaskIds.forEach((taskId) => {
            props.deps.stateSyncer.deleteTask(parseInt(taskId));
        });

        storyTaskSelectorRef.current.reset();
    };

    const onBacklogTaskSelectHandler = (taskId: number) => {
        backlogTaskSelectorRef.current.selectItem(taskId.toString());
    };

    const onStoryTaskSelectHandler = (taskId: number) => {
        storyTaskSelectorRef.current.selectItem(taskId.toString());
    };

    const onCreateTaskInBacklog = (task: CreateTaskInput) => {
        props.deps.stateSyncer.createTask(
            props.deps.localStore.getState().currTeamId!,
            task,
        );
        setOnEditingNewTaskInBacklog(false);
    };

    const onCreateTaskInStory = async (task: CreateTaskInput) => {
        const taskId = await props.deps.stateSyncer.createTask(
            props.deps.localStore.getState().currTeamId!,
            task,
        );

        props.deps.stateSyncer.addTaskToStory(props.storyId, taskId);
        setOnEditingNewTaskInStory(false);
    };

    const onDiscardNewTaskInBacklog = () => {
        setOnEditingNewTaskInBacklog(false);
    };

    const onDiscardNewTaskInStory = () => {
        setOnEditingNewTaskInStory(false);
    };

    const onAddTasksToStoryClick = async () => {
        const tasks = Array.from(selectBacklogTaskIds).map((taskId) => {
            return parseInt(taskId);
        });

        await props.deps.stateSyncer.addTasksToStory(props.storyId, tasks);
        await backlogTaskSelectorRef.current.reset();
    };

    const onDeleteBacklogTasksClick = async () => {
        selectBacklogTaskIds.forEach((taskId) => {
            props.deps.stateSyncer.deleteTask(parseInt(taskId));
        });

        await backlogTaskSelectorRef.current.reset();
    };

    const onRemoveTasksFromStoryClick = async () => {
        const taskIds = Array.from(selectStoryTaskIds).map((taskId) =>
            parseInt(taskId),
        );
        await props.deps.stateSyncer.removeTasksFromStory(props.storyId, tasks);
        await storyTaskSelectorRef.current.reset();
    };

    const handleBacklogFilterChange = (optionKey: string) => {
        setSelectedBacklogTasksFilter(optionKey as backlogTasksFilterOption);
    };

    let backlogTasks = tasks
        .filter(
            (task) =>
                !story?.tasks.some((storyTask) => storyTask.id === task.id),
        )
        .sort(orderByStatusUrgencyAsc);
    switch (selectedBacklogTasksFilter) {
        case 'IS_PLANNED':
            backlogTasks = backlogTasks.filter(isPlanned);
            break;
        case 'UNPLANNED':
            backlogTasks = backlogTasks.filter(unplanned);
            break;
        case 'All':
            break;
    }

    if (!story) {
        return null;
    }

    return (
        <div className={styles.Story}>
            <div className={styles.StoryDetailSection}>
                <div className={styles.Header}>
                    <div className={styles.Information}>
                        {story.name}
                        <div className={styles.Description}>
                            {story.completedTasks} of {story.totalTasks} tasks
                            completed
                        </div>
                    </div>
                    <div className={styles.Actions}>
                        {selectStoryTaskIds.size > 0 && (
                            <>
                                <div
                                    className={`${styles.Action} ${styles.Remove}`}
                                    onClick={onRemoveTasksFromStoryClick}
                                >
                                    <MaterialIconUI>read_more</MaterialIconUI>
                                </div>
                                <div
                                    className={`${styles.Action} ${styles.Delete}`}
                                    onClick={onDeleteTasksFromStoryClick}
                                >
                                    <MaterialIconUI>close</MaterialIconUI>
                                </div>
                            </>
                        )}
                        <div
                            className={`${styles.Action} ${styles.Add}`}
                            onClick={onAddTaskToStoryClick}
                        >
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                    </div>
                </div>
                <div className={styles.TasksSection}>
                    {onEditingNewTaskInStory && (
                        <InlineCreateTaskUI
                            deps={props.deps}
                            numActionColumns={props.numActionColumns}
                            onCreateTask={onCreateTaskInStory}
                            onDiscardNewTask={onDiscardNewTaskInStory}
                        />
                    )}
                    {story.tasks.map((task) => (
                        <div key={task.id} className={styles.InlineTask}>
                            <TaskListItem
                                deps={props.deps}
                                relativeLayout={props.deps.relativeLayout}
                                task={task}
                                currentClientId={currentClientId}
                                isSelected={selectStoryTaskIds.has(
                                    task.id.toString(),
                                )}
                                onTaskSelectHandler={onStoryTaskSelectHandler}
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
                    <div className={styles.Filter}>
                        <DropDownList
                            selectOptionKey={selectedBacklogTasksFilter}
                            options={backlogTasksFilterOptions}
                            onSelectOption={handleBacklogFilterChange}
                        />
                    </div>
                    <div className={styles.Actions}>
                        {selectBacklogTaskIds.size > 0 && (
                            <div
                                className={`${styles.Action} ${styles.Move}`}
                                onClick={onAddTasksToStoryClick}
                            >
                                <MaterialIconUI>read_more</MaterialIconUI>
                            </div>
                        )}
                        {selectBacklogTaskIds.size > 0 && (
                            <div
                                className={`${styles.Action} ${styles.Delete}`}
                                onClick={onDeleteBacklogTasksClick}
                            >
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        )}
                        <div
                            className={`${styles.Action} ${styles.Add}`}
                            onClick={onAddTaskInBacklogClick}
                        >
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                    </div>
                </div>
                <div className={styles.TaskList}>
                    {onEditingNewTaskInBacklog && (
                        <InlineCreateTaskUI
                            deps={props.deps}
                            numActionColumns={1}
                            onCreateTask={onCreateTaskInBacklog}
                            onDiscardNewTask={onDiscardNewTaskInBacklog}
                        />
                    )}
                    {backlogTasks.map((task) => (
                        <div className={styles.ListItem} key={task.id}>
                            <TaskListItem
                                deps={props.deps}
                                relativeLayout={props.deps.relativeLayout}
                                sectionId={backlogSectionId}
                                dragAndDropController={
                                    props.deps.dragAndDropController
                                }
                                onTaskSelectHandler={onBacklogTaskSelectHandler}
                                isSelected={selectBacklogTaskIds.has(
                                    task.id.toString(),
                                )}
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
