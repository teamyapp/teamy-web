import React, { Component, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { FeedbackUI } from '@lib/ui/Feedback';

import { Deps } from '@core/dep/deps';
import { Feedback } from '@core/entity/feedback';
import { Invitation } from '@core/entity/invitation';

import styles from './feedback.module.scss';

export interface Props {
    deps: Deps;
}

export interface State {
    invitation?: Invitation;
}

export class InvitationLinkCopiedFeedbackComponent extends Component<
    Props,
    State
> {
    private feedbackChan?: csp.PopChannel<Feedback | undefined>;
    private readonly feedbackRef = createRef<FeedbackUI>();

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    public render() {
        const receiverName = `${this.state.invitation?.receiverFirstName} ${this.state.invitation?.receiverLastName}`;
        return (
            <FeedbackUI ref={this.feedbackRef}>
                Invitation link for
                <span className={styles.Highlight}>{receiverName}</span>is
                copied to the clipboard.
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

                if (feedback.type === 'InvitationLinkCopied') {
                    this.setState({
                        invitation: feedback.invitation,
                    });
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
