import classNames from 'classnames';
import moment from 'moment';
import {
    FC,
    MouseEvent,
    ReactElement,
    useEffect,
    useRef,
    useState,
} from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { Project } from '@core/entity/project';
import { Team } from '@core/entity/team';
import { projectPath } from '@core/routing/routes';

import {
    CreateProjectModalComponent,
    CreateProjectModalComponentHandle,
} from './CreateProjectModal.component';
import styles from './Projects.component.module.scss';
import {
    Row,
    TimelineComponent,
    TimelineComponentHandle,
} from './Timeline.component';
import {
    UpdateProjectModalComponent,
    UpdateProjectModalComponentHandle,
} from './UpdateProjectModal.component';

interface Props {
    deps: Deps;
}

const startAt = moment().subtract(1, 'months').toDate();
const endAt = moment().add(1, 'months').toDate();

export const ProjectsComponent: FC<Props> = (props) => {
    const timelineRef = useRef<TimelineComponentHandle>(null);
    const createProjectModalComponentRef =
        useRef<CreateProjectModalComponentHandle>(null);
    const updateProjectModalComponentRef =
        useRef<UpdateProjectModalComponentHandle>(null);
    const [editingProject, setEditingProject] = useState<Project>();
    const [selectedProjectIndex, setSelectedProjectIndex] = useState<number>();
    const [team, setTeam] = useState<Team>();

    useEffect(() => {
        const stateChangeChan = props.deps.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('[ProjectsComponent] waiting for state changes');
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
        })().then();
    }, []);

    const rows: Row[] = (team?.projects || []).map((project, index) => {
        return {
            height: 70,
            items: [
                {
                    view: (
                        <div className={styles.Project}>
                            <div className={styles.ProgressBar}>
                                <div
                                    className={styles.Progress}
                                    style={{
                                        width: `${
                                            (project.deliveredPhases /
                                                project.totalPhases) *
                                            100
                                        }%`,
                                    }}
                                />
                            </div>
                            <div className={styles.Name}>{project.name}</div>
                            <div className={styles.Status}>
                                {project.deliveredPhases} of{' '}
                                {project.totalPhases} phases delivered
                            </div>
                        </div>
                    ),
                    startAt: project.expectedStartAt,
                    endAt: project.expectedEndAt,
                },
            ],
        };
    });

    const onProjectClickHandler = (projectIndex: number) => {
        return () => {
            timelineRef.current?.showAndSelectItem(projectIndex, 0);
            setSelectedProjectIndex(projectIndex);
        };
    };

    const onProjectDoubleClickHandler = (projectId: number) => {
        return (event: MouseEvent) => {
            event.stopPropagation();
            if (!team) {
                return;
            }

            props.deps.router.navigateTo(projectPath(team.id, projectId));
        };
    };

    const onTimelineItemSelect = (rowIndex: number, itemIndex: number) => {
        setSelectedProjectIndex(rowIndex);
    };

    const onAddProjectClick = () => {
        createProjectModalComponentRef.current?.open();
    };

    const onDeleteProjectClickHandler =
        (projectId: number) => (event: MouseEvent) => {
            event.stopPropagation();
            props.deps.stateSyncer.deleteProject(projectId);
        };

    const onUpdateProjectClickHandler =
        (project: Project) => (event: MouseEvent) => {
            event.stopPropagation();
            setEditingProject(project);
            updateProjectModalComponentRef.current?.open();
        };

    const renderProject = (project: Project, index: number): ReactElement => {
        return (
            <div
                key={index}
                className={`${styles.Project} ${classNames({
                    [styles.Selected]: index === selectedProjectIndex,
                })}`}
                onDoubleClick={onProjectDoubleClickHandler(project.id)}
                onClick={onProjectClickHandler(index)}
            >
                <div className={styles.LeftSection}>
                    <div className={styles.Name}>{project.name}</div>
                    <div className={styles.Status}>
                        {project.deliveredPhases} of {project.totalPhases}{' '}
                        phases delivered
                    </div>
                    <div className={styles.Duration}>
                        {moment(project.expectedStartAt).format('MMM DD')}
                        &nbsp;-&nbsp;
                        {moment(project.expectedEndAt).format('MMM DD')}
                    </div>
                </div>
                <div className={styles.RightSection}>
                    <div
                        className={styles.DeleteIcon}
                        onClick={onDeleteProjectClickHandler(project.id)}
                    >
                        <MaterialIconUI>close</MaterialIconUI>
                    </div>
                    <div
                        className={styles.EditIcon}
                        onClick={onUpdateProjectClickHandler(project)}
                    >
                        <MaterialIconUI>edit</MaterialIconUI>
                    </div>
                </div>
            </div>
        );
    };

    if (!team) {
        return null;
    }

    return (
        <div className={styles.Projects}>
            <div className={styles.ProjectView}>
                <div className={styles.ProjectListSection}>
                    <div className={styles.TopBar}>
                        <div className={styles.Title}>Projects</div>
                        <div className={styles.Add} onClick={onAddProjectClick}>
                            <MaterialIconUI>add</MaterialIconUI>
                        </div>
                    </div>
                    <div className={styles.ProjectList}>
                        {team.projects.map(renderProject)}
                    </div>
                </div>
                <div className={styles.Timeline}>
                    <TimelineComponent
                        ref={timelineRef}
                        startAt={startAt}
                        endAt={endAt}
                        rows={rows}
                        onItemSelect={onTimelineItemSelect}
                    />
                </div>
            </div>
            <CreateProjectModalComponent
                deps={props.deps}
                ref={createProjectModalComponentRef}
            />
            {editingProject && (
                <UpdateProjectModalComponent
                    deps={props.deps}
                    ref={updateProjectModalComponentRef}
                    project={editingProject}
                />
            )}
        </div>
    );
};
