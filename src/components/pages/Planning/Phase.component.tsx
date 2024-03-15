import { useState } from 'react';

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
