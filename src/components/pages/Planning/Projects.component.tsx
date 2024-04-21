import {
    ChangeEvent,
    FC,
    MouseEvent,
    useEffect,
    useRef,
    useState,
} from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { Team } from '@core/entity/team';
import { projectPath } from '@core/routing/routes';

import {
    CreateProjectModalComponent,
    CreateProjectModalComponentHandle,
} from './CreateProjectModal.component';
import styles from './Projects.component.module.scss';
import { TooltipUI } from '@lib/ui/Tooltip';
import { UpdateProjectInput } from '@core/entity/input';

interface Props {
    deps: Deps;
}

export const ProjectsComponent: FC<Props> = (props) => {
    const createProjectModalComponentRef =
        useRef<CreateProjectModalComponentHandle>(null);
    const [team, setTeam] = useState<Team>();
    const [editingUpdateProject, setEditingUpdateProject] = useState<{
        projectId: number;
        updateProjectInput: UpdateProjectInput;
    }>();

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

    const onViewProjectCardClickHandler = (projectId: number) => {
        return (event: MouseEvent) => {
            event.stopPropagation();
            if (!team) {
                return;
            }

            props.deps.router.navigateTo(projectPath(team.id, projectId));
        };
    };

    const onAddProjectClick = () => {
        createProjectModalComponentRef.current?.open();
    };

    const onDeleteProjectClickHandler =
        (projectId: number) => (event: MouseEvent) => {
            event.stopPropagation();
            props.deps.stateSyncer.deleteProject(projectId);
        };

    const onSaveProjectClick = (event: MouseEvent) => {
        if (!editingUpdateProject) {
            return;
        }

        event.stopPropagation();
        props.deps.stateSyncer.updateProject(
            editingUpdateProject.projectId,
            editingUpdateProject.updateProjectInput,
        );

        setEditingUpdateProject(undefined);
    };

    const onCancelProjectClick = () => {
        setEditingUpdateProject(undefined);
    };

    const onEditProjectClickHandler = (projectId: number) => () => {
        const project = props.deps.graphSource.project(projectId);
        if (!project) {
            return;
        }

        setEditingUpdateProject({
            projectId,
            updateProjectInput: {
                name: project.name,
                expectedEndAt: project.expectedEndAt,
                expectedStartAt: project.expectedStartAt,
                actualStartAt: project.actualStartAt,
                actualEndAt: project.actualEndAt,
                iconUrl: project.iconUrl,
                color: project.color,
            },
        });
    };

    const onProjectNameChangeHandler =
        (projectId: number) => (event: ChangeEvent<HTMLInputElement>) => {
            if (!editingUpdateProject) {
                return;
            }

            setEditingUpdateProject({
                projectId,
                updateProjectInput: {
                    ...editingUpdateProject.updateProjectInput,
                    name: event.target.value,
                },
            });
        };

    if (!team) {
        return null;
    }

    return (
        <div className={styles.Projects}>
            <div className={styles.Section}>
                <div className={styles.TitleRow}>
                    <div className={styles.TitleActions}>
                        <div
                            className={`${styles.TitleAction} ${styles.CreateProject}`}
                            onClick={onAddProjectClick}
                        >
                            Create project
                        </div>
                    </div>
                </div>
                <div className={`${styles.Section} ${styles.ProjectList}`}>
                    {team.projects.map((project) => (
                        <div className={styles.Project}>
                            <div
                                className={styles.Card}
                                style={{
                                    backgroundColor: project.color,
                                }}
                                onClick={onViewProjectCardClickHandler(
                                    project.id,
                                )}
                            >
                                {project.iconUrl ? (
                                    <div className={styles.IconUrl}>
                                        <img src={project.iconUrl}/>
                                    </div>
                                ) : (
                                    <div className={styles.Icon}>
                                        <MaterialIconUI>
                                            construction
                                        </MaterialIconUI>
                                    </div>
                                )}
                            </div>
                            <div className={styles.NameRow}>
                                <div className={styles.Name}>
                                    {editingUpdateProject?.projectId ===
                                    project.id ? (
                                        <input
                                            className={styles.TextField}
                                            value={
                                                editingUpdateProject
                                                    .updateProjectInput.name
                                            }
                                            onChange={onProjectNameChangeHandler(
                                                project.id,
                                            )}
                                        ></input>
                                    ) : (
                                        project.name
                                    )}
                                </div>
                                <div className={styles.Actions}>
                                    {editingUpdateProject?.projectId === project.id ? (
                                        <>
                                            <TooltipUI
                                                message='Save'
                                                relativeLayout={
                                                    props.deps.relativeLayout
                                                }
                                            >
                                                <div
                                                    className={`${styles.Edit} ${styles.Action}`}
                                                    onClick={onSaveProjectClick}
                                                >
                                                    <MaterialIconUI>
                                                        save
                                                    </MaterialIconUI>
                                                </div>
                                            </TooltipUI>
                                            <TooltipUI
                                                message='Cancel'
                                                relativeLayout={
                                                    props.deps.relativeLayout
                                                }
                                            >
                                                <div
                                                    className={`${styles.Cancel} ${styles.Action}`}
                                                    onClick={
                                                        onCancelProjectClick
                                                    }
                                                >
                                                    <MaterialIconUI>
                                                        cancel
                                                    </MaterialIconUI>
                                                </div>
                                            </TooltipUI>
                                        </>
                                    ) : (
                                        <>
                                            <TooltipUI
                                                message='Edit'
                                                relativeLayout={
                                                    props.deps.relativeLayout
                                                }
                                            >
                                                <div
                                                    className={`${styles.Edit} ${styles.Action}`}
                                                    onClick={onEditProjectClickHandler(
                                                        project.id,
                                                    )}
                                                >
                                                    <MaterialIconUI>
                                                        edit
                                                    </MaterialIconUI>
                                                </div>
                                            </TooltipUI>
                                            <TooltipUI
                                                message='Delete'
                                                relativeLayout={
                                                    props.deps.relativeLayout
                                                }
                                            >
                                                <div
                                                    className={`${styles.Delete} ${styles.Action}`}
                                                    onClick={onDeleteProjectClickHandler(
                                                        project.id,
                                                    )}
                                                >
                                                    <MaterialIconUI>
                                                        close
                                                    </MaterialIconUI>
                                                </div>
                                            </TooltipUI>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={styles.Description}>
                                {project.deliveredPhases} of{' '}
                                {project.totalPhases} phases delivered
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <CreateProjectModalComponent
                deps={props.deps}
                ref={createProjectModalComponentRef}
            />
        </div>
    );
};
