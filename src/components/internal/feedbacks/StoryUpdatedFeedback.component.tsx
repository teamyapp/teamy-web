import React, {FC, createRef, useState } from 'react';
import { FeedbackUI } from '@lib/ui/Feedback';

import { Deps } from '@core/dep/deps';
import styles from './feedback.module.scss';

export interface Props {
    deps: Deps;
}

export const StoryUpdatedFeedbackComponent: FC<Props> = (props: Props) => {
    const feedbackRef = createRef<FeedbackUI>();
    const feedbackChan = props.deps.feedbackPubSub.subscribe();
    const [storyId, setStoryId] = useState<number>();

    (async () => {
        while (true) {
            const feedback = await feedbackChan?.pop();
            if (feedback === undefined) {
                return;
            }

            if (feedback.type === 'StoryUpdated') {
                setStoryId(feedback.storyId);
                feedbackRef.current?.show();
            } else {
                feedbackRef.current?.hide();
            }
        }
    })().then();

    return (
        <FeedbackUI ref={feedbackRef}>
            Story
            <span className={styles.Highlight}>#{storyId}</span>
            is updated.
        </FeedbackUI>
    );
};
