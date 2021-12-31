import { ComponentStory } from '@storybook/react';
import { Component, createRef } from 'react';

import { initDeps } from '@core/dep/deps';

import { UserModalComponent } from './UserModal.component';
import styles from './UserModal.component.stories.module.scss';

export default {
    component: UserModalComponent,
};

const deps = initDeps();

class ModalStory extends Component<any, any> {
    private readonly modalRef = createRef<UserModalComponent>();

    render() {
        return (
            <div className={styles.ModalStory}>
                <UserModalComponent ref={this.modalRef} deps={deps} />
            </div>
        );
    }

    public componentDidMount() {
        this.modalRef.current?.open({
            id: 2,
            firstName: 'Cute',
            lastName: 'Girl',
            profileUrl: '/profiles/girl1.png',
        });
    }
}

export const Primary: ComponentStory<typeof UserModalComponent> = () => {
    return <ModalStory />;
};
