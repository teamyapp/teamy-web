import { ComponentStory } from '@storybook/react';
import { Button } from './Button';

import styles from './Button.stories.module.scss';

export default {
    component: Button,
    argTypes: {
        label: {
            control: 'text',
        },
        onClick: {
            action: 'onClick',
        },
    },
};

const Template: ComponentStory<typeof Button> = ({ label, onClick }) => {
    return (
        <div className={styles.Box}>
            <Button label={label} onClick={onClick} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Add',
};
