import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import { TaskDetailModalComponent } from 'components/internal/Modals/TaskDetailModal.component';

import { Route } from '@lib/router/Route';

import { Deps } from '@core/dep/deps';
import {
    getPhaseId,
    getProjectId,
    getStoryId,
    phasePath,
    phaseRoutePattern,
    projectPath,
    projectRoutePattern,
    projectsPath,
    projectsRoutePattern,
    standaloneStoryRoutePattern,
    storyRoutePattern,
} from '@core/routing/routes';
import { toInt } from '@core/storage/states/parser';

import { PhaseComponent } from './Phase.component';
import styles from './Planning.component.module.scss';
import { ProjectComponent } from './Project.component';
import { StoryComponent } from './Story.component';
import { ProjectsComponent } from './projects.component';

interface Props {
    deps: Deps;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
    numActionColumns: number;
    onViewTaskDetail: (taskId: number) => void;
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
    const phase = phaseId ? props.deps.graphSource.phase(phaseId) : undefined;
    const story = storyId && props.deps.graphSource.story(storyId);

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
                        <>
                            {index > 0 && <div className={styles.Separator} />}
                            <div
                                key={index}
                                className={styles.Level}
                                onClick={level.onClick}
                            >
                                {level.name}
                            </div>
                        </>
                    );
                })}
            </div>

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
                    <ProjectComponent project={project} deps={props.deps} />
                )}
            </Route>
            <Route router={props.deps.router} pattern={phaseRoutePattern} exact>
                {project && phase && (
                    <PhaseComponent
                        project={project}
                        phase={phase}
                        deps={props.deps}
                    />
                )}
            </Route>

            <Route
                router={props.deps.router}
                pattern={standaloneStoryRoutePattern}
                exact
            >
                {project && story && (
                    <StoryComponent
                        project={project}
                        story={story}
                        deps={props.deps}
                        thirdPartyAppEventHubs={props.thirdPartyAppEventHubs}
                        numActionColumns={props.numActionColumns}
                        onViewTaskDetail={props.onViewTaskDetail}
                    />
                )}
            </Route>

            <Route router={props.deps.router} pattern={storyRoutePattern} exact>
                {project && story && phase && (
                    <StoryComponent
                        project={project}
                        phase={phase}
                        story={story}
                        deps={props.deps}
                        thirdPartyAppEventHubs={props.thirdPartyAppEventHubs}
                        numActionColumns={props.numActionColumns}
                        onViewTaskDetail={props.onViewTaskDetail}
                    />
                )}
            </Route>

            <TaskDetailModalComponent
                ref={this.taskDetailModalRef}
                deps={this.props.deps}
                afterClose={this.afterTaskDetailModalClose}
            />
        </div>
    );
}
