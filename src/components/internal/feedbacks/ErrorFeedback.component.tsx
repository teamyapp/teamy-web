import React, { FC, ReactNode, useRef, useState } from 'react';
import { Deps } from '@core/dep/deps';
import { FeedbackUI } from '@lib/ui/Feedback';

export interface Props {
    deps: Deps;
}

export const ErrorFeedbackComponent: FC<Props> = (props: Props) => {
    const feedbackChan = props.deps.feedbackPubSub.subscribe();
    const feedbackRef = useRef<FeedbackUI>(null);
    const [errMessage, setErrMessage] = useState<ReactNode>();
    (async () => {
        while (true) {
            const feedback = await feedbackChan?.pop();
            if (feedback === undefined) {
                return;
            }

            if (feedback.type === 'Error') {
                setErrMessage(feedback.children);
                feedbackRef.current?.show();
            } else {
                feedbackRef.current?.hide();
            }
        }
    })().then();
    return (
        <FeedbackUI ref={feedbackRef}>
            {errMessage}
        </FeedbackUI>
    );
};
