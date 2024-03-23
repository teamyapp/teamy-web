import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import { TaskDetailModalComponent } from 'components/internal/Modals/TaskDetailModal.component';
import { Fragment, useRef } from 'react';

import { Route } from '@lib/router/Route';

import { Deps } from '@core/dep/deps';
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

import { ProjectComponent } from './Project.component';
import { ProjectsComponent } from './Projects.component';
import styles from './Planning.component.module.scss';

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
    const currentTeam = props.deps.graphSource.currentTeam();
    if (!currentTeam) {
        return null;
    }

    // TODO: intercept the route and get the project, phase, and story
    const routeUpdateParams = props.deps.router.currentRouteUpdate.params;
    const projectId = toInt(getProjectId(routeUpdateParams));
    const phaseId = toInt(getPhaseId(routeUpdateParams));
    const storyId = toInt(getStoryId(routeUpdateParams));

    const project = projectId && props.deps.graphSource.project(projectId);
    const phase = phaseId && props.deps.graphSource.phase(phaseId);
    const story = storyId && props.deps.graphSource.story(storyId);

    const taskDetailModalRef = useRef<TaskDetailModalComponent>(null);
    const onViewTaskDetail = (taskId: number) => {
        taskDetailModalRef.current?.open(taskId);
    };

    const location: Level[] = [
        {
            name: 'Projects',
            onClick: () => {
                props.deps.router.navigateTo(projectsPath(currentTeam.id));
            },
        },
    ];

    if (project) {
        location.push({
            name: project.name,
            onClick: () => {
                props.deps.router.navigateTo(
                    projectPath(currentTeam.id, project.id),
                );
            },
        });

        if (phase) {
            location.push({
                name: phase.name,
                onClick: () => {
                    props.deps.router.navigateTo(
                        phasePath(currentTeam.id, project.id, phase.id),
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
                    phase
                </Route>
                <Route
                    router={props.deps.router}
                    pattern={projectStoryRoutePattern}
                    exact
                >
                    story
                </Route>
                <Route
                    router={props.deps.router}
                    pattern={phaseStoryRoutePattern}
                    exact
                >
                    story
                </Route>
            </div>
            <TaskDetailModalComponent
                ref={taskDetailModalRef}
                deps={props.deps}
            />
        </div>
    );
}
