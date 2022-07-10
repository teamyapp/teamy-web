import { ComponentStory } from '@storybook/react';
import { Component, createRef } from 'react';

import { initDeps } from '@core/dep/deps';

import { UserSettingsModalComponent } from './UserSettingsModal.component';
import styles from './UserSettingsModal.component.stories.module.scss';

export default {
    component: UserSettingsModalComponent,
};

const deps = initDeps();

class ModalStory extends Component<any, any> {
    private readonly modalRef = createRef<UserSettingsModalComponent>();

    render() {
        return (
            <div className={styles.ModalStory}>
                <UserSettingsModalComponent ref={this.modalRef} deps={deps} />
            </div>
        );
    }

    public componentDidMount() {
        this.modalRef.current?.open({
            id: 2,
            firstName: 'Cute',
            lastName: 'Girl',
            profileUrl: '/profiles/girl1.png',
            teams: [],
            linkedUsers: [],
        });
    }
}

export const Primary: ComponentStory<typeof UserSettingsModalComponent> =
    () => {
        return <ModalStory />;
    };
