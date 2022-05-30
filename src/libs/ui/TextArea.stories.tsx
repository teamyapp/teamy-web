import { ComponentStory } from '@storybook/react';

import { TextAreaUI } from './TextArea';
import styles from './TextArea.stories.module.scss';

export default {
    component: TextAreaUI,
    argTypes: {
        label: {
            control: 'text',
        },
        placeholder: {
            control: 'text',
        },
        onChange: {
            action: 'onChange',
        },
    },
};

const Template: ComponentStory<typeof TextAreaUI> = ({
    label,
    placeholder,
    onChange,
}) => {
    return (
        <div className={styles.Box}>
            <TextAreaUI
                label={label}
                placeholder={placeholder}
                onChange={onChange}
            />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Name',
    placeholder: 'FirstName LastName',
};
