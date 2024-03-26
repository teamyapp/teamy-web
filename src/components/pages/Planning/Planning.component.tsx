import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import { TaskDetailModalComponent } from 'components/internal/Modals/TaskDetailModal.component';
import { Fragment, useEffect, useRef, useState } from 'react';

import { Route } from '@lib/router/Route';

import { Deps } from '@core/dep/deps';
import { Team } from '@core/entity/team';
import {
    getPhaseId,
    getProjectId,
    getStoryId,
    phasePath,
    phaseRoutePattern,
    phaseStoryRoutePattern,
    projectPath,
    projectRoutePattern,
    projectStoryRoutePattern,
    projectsPath,
    projectsRoutePattern,
} from '@core/routing/routes';
import { toInt } from '@core/storage/states/parser';

import { PhaseComponent } from './Phase.component';
import styles from './Planning.component.module.scss';
import { ProjectComponent } from './Project.component';
import { ProjectsComponent } from './Projects.component';
import { StoryComponent } from './Story.component';

interface Props {
    deps: Deps;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
    numActionColumns: number;
}

interface Level {
    name: string;
    onClick?: () => void;
}

export function PlanningComponent(props: Props) {
    const taskDetailModalRef = useRef<TaskDetailModalComponent>(null);
    const [team, setTeam] = useState<Team>();

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

                const currentTeam = props.deps.graphSource.currentTeam();
                if (currentTeam) {
                    setTeam(currentTeam);
                }
            }
        })();
    }, []);

    // TODO: intercept the route and get the project, phase, and story
    const routeUpdateParams = props.deps.router.currentRouteUpdate.params;
    const projectId = toInt(getProjectId(routeUpdateParams));
    const phaseId = toInt(getPhaseId(routeUpdateParams));
    const storyId = toInt(getStoryId(routeUpdateParams));

    const project = projectId && props.deps.graphSource.project(projectId);
    const phase = phaseId && props.deps.graphSource.phase(phaseId);
    const story = storyId && props.deps.graphSource.story(storyId);

    const onViewTaskDetail = (taskId: number) => {
        taskDetailModalRef.current?.open(taskId);
    };

    if (!team) {
        return null;
    }

    const location: Level[] = [
        {
            name: 'Projects',
            onClick: () => {
                props.deps.router.navigateTo(projectsPath(team.id));
            },
        },
    ];

    if (project) {
        location.push({
            name: project.name,
            onClick: () => {
                props.deps.router.navigateTo(
                    projectPath(team.id, project.id),
                );
            },
        });

        if (phase) {
            location.push({
                name: phase.name,
                onClick: () => {
                    props.deps.router.navigateTo(
                        phasePath(team.id, project.id, phase.id),
                    );
                },
            });
        }

        if (story) {
            location.push({
                name: story.name,
            });
        }
    }

    return (
        <div className={styles.Planning}>
            <div className={styles.Location}>
                {location.map((level, index) => {
                    return (
                        <Fragment key={`location-${index}`}>
                            {index > 0 && <div className={styles.Separator} />}
                            <div
                                className={styles.Level}
                                onClick={level.onClick}
                            >
                                {level.name}
                            </div>
                        </Fragment>
                    );
                })}
            </div>
            <div className={styles.Content}>
                <Route
                    router={props.deps.router}
                    pattern={projectsRoutePattern}
                    exact
                >
                    <ProjectsComponent deps={props.deps} />
                </Route>
                <Route
                    router={props.deps.router}
                    pattern={projectRoutePattern}
                    exact
                >
                    {project && (
                        <ProjectComponent deps={props.deps} project={project} />
                    )}
                </Route>
                <Route
                    router={props.deps.router}
                    pattern={phaseRoutePattern}
                    exact
                >
                    {project && phase && (
                        <PhaseComponent
                            deps={props.deps}
                            project={project}
                            phase={phase}
                        />
                    )}
                </Route>
                <Route
                    router={props.deps.router}
                    pattern={projectStoryRoutePattern}
                    exact
                >
                    {project && story && (
                        <StoryComponent
                            deps={props.deps}
                            project={project}
                            story={story}
                            thirdPartyAppEventHubs={
                                props.thirdPartyAppEventHubs
                            }
                            numActionColumns={props.numActionColumns}
                            onViewTaskDetail={onViewTaskDetail}
                        />
                    )}
                </Route>
                <Route
                    router={props.deps.router}
                    pattern={phaseStoryRoutePattern}
                    exact
                >
                    {project && phase && story && (
                        <StoryComponent
                            deps={props.deps}
                            project={project}
                            phase={phase}
                            story={story}
                            thirdPartyAppEventHubs={
                                props.thirdPartyAppEventHubs
                            }
                            numActionColumns={props.numActionColumns}
                            onViewTaskDetail={onViewTaskDetail}
                        />
                    )}
                </Route>
            </div>
            <TaskDetailModalComponent
                ref={taskDetailModalRef}
                deps={props.deps}
            />
        </div>
    );
}
