import { UserProfileUI } from 'components/internal/UserProfile';
import { FC } from 'react';

import { Deps } from '@core/dep/deps';
import { projectPath } from '@core/routing/routes';

import styles from './Projects.component.module.scss';

interface Props {
    deps: Deps;
}

export const ProjectsComponent: FC<Props> = (props) => {
    const currentTeam = props.deps.graphSource.currentTeam();
    if (!currentTeam) {
        return null;
    }

    const handleProjectClicked = (projectId: number) => {
        return () =>
            props.deps.router.navigateTo(
                projectPath(currentTeam.id, projectId),
            );
    };

    const projects = props.deps.graphSource.projects();

    return (
        <div className={styles.ProjectsSection}>
            {projects.map((project) => (
                <div
                    key={project.id}
                    className={styles.Project}
                    onClick={handleProjectClicked(project.id)}
                >
                    <div className={styles.Name}>{project.name}</div>
                    <div className={styles.Creator}>
                        <UserProfileUI user={project.creator} />
                    </div>
                </div>
            ))}
        </div>
    );
};
