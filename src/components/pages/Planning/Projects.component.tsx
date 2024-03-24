import classNames from 'classnames';
import moment from 'moment';
import { FC, ReactElement, createRef, useRef, useState } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { Project } from '@core/entity/project';
import { projectPath } from '@core/routing/routes';

import {
    CreateProjectModalComponent,
    CreateProjectModalComponentHandle,
} from './CreateProjectModal.component';
import {
    Row,
    TimelineComponent,
    TimelineComponentHandle,
} from './Timeline.component';
import styles from './Projects.component.module.scss';

interface Props {
    deps: Deps;
}

const startAt = moment().subtract(1, 'months').toDate();
const endAt = moment().add(1, 'months').toDate();

export const ProjectsComponent: FC<Props> = (props) => {
    const timelineRef = useRef<TimelineComponentHandle>(null);
    const createProjectModalComponentRef =
        useRef<CreateProjectModalComponentHandle>(null);
    const [selectedProjectIndex, setSelectedProjectIndex] = useState<number>();
    const currentTeam = props.deps.graphSource.currentTeam();
    if (!currentTeam) {
        return null;
    }

    const rows: Row[] = currentTeam.projects.map((project, index) => {
        const ref = createRef<HTMLDivElement>();
        return {
            height: 70,
            items: [
                {
                    ref,
                    view: (
                        <div className={styles.Project} ref={ref}>
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
                    <div className={styles.DeleteIcon}>
                        <MaterialIconUI>close</MaterialIconUI>
                    </div>
                </div>
            </div>
        );
    };

    const onProjectClickHandler = (projectIndex: number) => {
        return () => {
            timelineRef.current?.showAndSelectItem(projectIndex, 0);
            setSelectedProjectIndex(projectIndex);
        };
    };

    const onProjectDoubleClickHandler = (projectId: number) => {
        return () => {
            props.deps.router.navigateTo(
                projectPath(currentTeam.id, projectId),
            );
        };
    };

    const onTimelineItemSelect = (rowIndex: number, itemIndex: number) => {
        setSelectedProjectIndex(rowIndex);
    };

    const onAddProjectClick = () => {
        createProjectModalComponentRef.current?.open();
    };

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
                        {currentTeam.projects.map(renderProject)}
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
        </div>
    );
};
