import React, { Component, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { FeedbackUI } from '@lib/ui/Feedback';

import { Deps } from '@core/dep/deps';
import { Feedback } from '@core/entity/feedback';

export interface Props {
    deps: Deps;
}

export class TeamProfileUpdatedFeedbackComponent extends Component<Props> {
    private feedbackChan?: csp.PopChannel<Feedback | undefined>;
    private readonly feedbackRef = createRef<FeedbackUI>();

    public render() {
        return (
            <FeedbackUI ref={this.feedbackRef}>
                Team profile is updated.
            </FeedbackUI>
        );
    }

    public componentDidMount() {
        this.feedbackChan = this.props.deps.feedbackPubSub.subscribe();
        (async () => {
            while (true) {
                const feedback = await this.feedbackChan?.pop();
                if (feedback === undefined) {
                    return;
                }

                if (feedback.type === 'TeamProfileUpdated') {
                    this.feedbackRef.current?.show();
                } else {
                    this.feedbackRef.current?.hide();
                }
            }
        })().then();
    }

    public componentWillUnmount() {
        this.feedbackChan?.close();
    }
}
