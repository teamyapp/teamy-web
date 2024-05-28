import React, {FC, createRef, useState } from 'react';
import { FeedbackUI } from '@lib/ui/Feedback';

import { Deps } from '@core/dep/deps';
import styles from './feedback.module.scss';

export interface Props {
    deps: Deps;
}

export const TeamMemberGroupOrderUpdatedFeedback: FC<Props> = (props: Props) => {
    const feedbackRef = createRef<FeedbackUI>();
    const feedbackChan = props.deps.feedbackPubSub.subscribe();
    const [name, setName] = useState<string>();
    const [direction, setDirection] = useState<string>();

    (async () => {
        while (true) {
            const feedback = await feedbackChan?.pop();
            if (feedback === undefined) {
                return;
            }

            if (feedback.type === 'TeamMemberGroupOrderUpdated') {
                setName(feedback.name);
                setDirection(feedback.direction);
                feedbackRef.current?.show();
            } else {
                feedbackRef.current?.hide();
            }
        }
    })().then();

    return (
        <FeedbackUI ref={feedbackRef}>
            Team member group
            <span className={styles.Highlight}>#{name}</span>
            is {direction}.
        </FeedbackUI>
    );
};
