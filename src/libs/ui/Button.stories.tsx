import { ComponentStory } from '@storybook/react';

import { ButtonUI } from './Button';
import styles from './Button.stories.module.scss';

export default {
    component: ButtonUI,
    argTypes: {
        label: {
            control: 'text',
        },
        onClick: {
            action: 'onClick',
        },
    },
};

const Template: ComponentStory<typeof ButtonUI> = ({ label, onClick }) => {
    return (
        <div className={styles.Box}>
            <ButtonUI label={label} onClick={onClick} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Add',
};
