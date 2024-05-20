import React, { FC } from 'react';

import { Deps } from '@core/dep/deps';
import { DynamicFeedbackUI } from '@lib/ui/DynamicFeedback';

export interface Props {
    deps: Deps;
    dynamicFeedBackRef: React.RefObject<DynamicFeedbackUI>;
}

export const DynamicFeedbackComponent: FC<Props> = (props: Props) => {
    const feedbackChan = props.deps.feedbackPubSub.subscribe();

    (async () => {
        while (true) {
            const feedback = await feedbackChan?.pop();
            if (feedback === undefined) {
                return;
            }

            if (feedback.type === 'Dynamic') {
                props.dynamicFeedBackRef.current?.show(
                    feedback.children,
                    feedback.actionLabel,
                    feedback.onActionClick
                );
            }
        }
    })().then();

    return null;
};
