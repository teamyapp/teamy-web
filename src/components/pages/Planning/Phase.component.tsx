import { useEffect, useRef, useState } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { CreateStoryInput } from '@core/entity/input';
import { Phase } from '@core/entity/phase';
import { Project } from '@core/entity/project';
import { storyPath } from '@core/routing/routes';

import { InlineCreateStory } from './InlineCreateStory.component';
import styles from './Phase.component.module.scss';
import { StoryInlineItemComponent } from './StoryInlineItem.component';
import { ItemsSelector } from '@lib/event/keyBoardEventMoniter';

interface Props {
    deps: Deps;
    project: Project;
    phase: Phase;
}

export function PhaseComponent(props: Props) {
    const [onEditingNewStoryInBacklog, setOnEditingNewStoryInBacklog] =
        useState(false);
    const [onEditingNewStoryInPhase, setOnEditingNewStoryInPhase] =
        useState(false);
    const currentTeam = props.deps.graphSource.currentTeam();
    const [selectedBacklogStoryIds, setSelectedBacklogStoryIds] = useState<Set<string>>(new Set());
    const [selectedPhaseStoryIds, setSelectedPhaseStoryIds] = useState<Set<string>>(new Set());
    const selectedBacklogStoryIdsRef = useRef(selectedBacklogStoryIds);
    const selectedPhaseStoryIdsRef = useRef(selectedPhaseStoryIds);

    const ctrlKeyPressedRef = useRef(false);
    const backlogStorySelectorRef = useRef<ItemsSelector>(new ItemsSelector(
        ctrlKeyPressedRef.current,
        selectedBacklogStoryIds,
    ));

    const phaseStorySelectorRef = useRef<ItemsSelector>(new ItemsSelector(
        ctrlKeyPressedRef.current,
        selectedPhaseStoryIds,
    ));

    useEffect(() => {
        const selectedBacklogStoryChan = backlogStorySelectorRef.current.subscribeSelectedItemsChanged();
        const selectedPhaseStoryChan = phaseStorySelectorRef.current.subscribeSelectedItemsChanged();
        const keyBoardEventChan = props.deps.keyBoardEventMonitor.subscribe();
        
        (async () => {
            while (true) {
                const selectedBacklogStoryIds = await selectedBacklogStoryChan.pop();
                if (selectedBacklogStoryIds === undefined) {
                    return;
                }

                setSelectedBacklogStoryIds(selectedBacklogStoryIds);
                selectedBacklogStoryIdsRef.current = selectedBacklogStoryIds;                
            }
        })();

        (async () => {
            while (true) {
                const selectedPhaseStoryIds = await selectedPhaseStoryChan.pop();
                if (selectedPhaseStoryIds === undefined) {
                    return;
                }

                setSelectedPhaseStoryIds(selectedPhaseStoryIds);
                selectedPhaseStoryIdsRef.current = selectedPhaseStoryIds;
            }
        })();

        (async () => {
            while(true) {

            }
        })();
    }, [])


    if (!currentTeam) {
        return null;
    }

    const onBacklogStorySelect = (storyIdNumber: number) => {
        backlogStorySelectorRef.current.selectItem(storyIdNumber.toString());
    }

    const onPhaseStorySelect = (storyIdNumber: number) => {
        phaseStorySelectorRef.current.selectItem(storyIdNumber.toString());
    }
    

    const onClickStoryDetailHandler = async (storyId: number) => {
        await props.deps.stateSyncer.pullCurrentTeamTaskPreview({
            isPlanned: false,
        });

        props.deps.router.navigateTo(
            storyPath(
                currentTeam!.id,
                props.project.id,
                props.phase.id,
                storyId,
            ),
        );
    };

    const onAddStoryInPhaseClick = () => {
        setOnEditingNewStoryInPhase(true);
    };

    const onAddStoryInBacklogClick = () => {
        setOnEditingNewStoryInBacklog(true);
    };

    const onCreateStoryInPhase = (story: CreateStoryInput) => {
        // props.deps.stateSyncer.createStory(
        //     props.deps.localStore.getState().currTeamId!,
        //     story,
        // );
        setOnEditingNewStoryInPhase(false);
    };

    const onCreateStoryInBacklog = (story: CreateStoryInput) => {
        // props.deps.stateSyncer.createStory(
        //     props.deps.localStore.getState().currTeamId!,
        //     story,
        // );
        setOnEditingNewStoryInBacklog(false);
    };

    const onDiscardNewStoryInPhase = () => {
        setOnEditingNewStoryInPhase(false);
    };

    const onDiscardNewStoryInBacklog = () => {
        setOnEditingNewStoryInBacklog(false);
    };

    return (
        <div className={styles.Phase}>
            <div className={styles.PhaseDetail}>
                <div className={styles.Header}>
                    <div className={styles.Information}>
                        {props.phase.name}
                        <div className={styles.Description}>
                            {props.phase.deliveredStories} of{' '}
                            {props.phase.totalStories} stories delivered
                        </div>
                    </div>

                    <div className={styles.Actions}>
                        <div className={styles.Add}>
                            <ButtonUI
                                label='Add'
                                onClick={onAddStoryInPhaseClick}
                            />
                        </div>
                        <div className={styles.Delete}>
                            <ButtonUI label='Delete' />
                        </div>
                    </div>
                </div>

                <div className={styles.StoriesSection}>
                    {onEditingNewStoryInPhase && (
                        <InlineCreateStory
                            deps={props.deps}
                            onCreateStory={onCreateStoryInPhase}
                            onDiscardNewStory={onDiscardNewStoryInPhase}
                        />
                    )}
                    {props.phase.stories.map((story) => (
                        <div className={styles.InlineStory}>
                            <StoryInlineItemComponent
                                story={story}
                                key={story.id}
                                onClickStoryDetailHandler={
                                    onClickStoryDetailHandler
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.StoryListSection}>
                <div className={styles.TopBar}>
                    <div className={styles.Title}>Stories</div>
                    <div
                        className={styles.Add}
                        onClick={onAddStoryInBacklogClick}
                    >
                        <MaterialIconUI>add</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.StoryList}>
                    {onEditingNewStoryInBacklog && (
                        <InlineCreateStory
                            deps={props.deps}
                            onCreateStory={onCreateStoryInBacklog}
                            onDiscardNewStory={onDiscardNewStoryInBacklog}
                        />
                    )}
                    {props.project.stories.map((story) => (
                        <div key={story.id} className={styles.ListItem}>
                            <StoryInlineItemComponent
                                story={story}
                                key={story.id}
                                onClickStoryDetailHandler={
                                    onClickStoryDetailHandler
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
