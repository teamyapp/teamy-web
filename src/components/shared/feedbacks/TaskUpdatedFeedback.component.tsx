import React, { Component, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { FeedbackUI } from '@lib/ui/Feedback';

import { Deps } from '@core/dep/deps';
import { Feedback } from '@core/entity/feedback';
import { Task } from '@core/entity/task';

import styles from './feedback.module.scss';

export interface Props {
    deps: Deps;
}

interface State {
    task?: Task;
}

export class TaskUpdatedFeedbackComponent extends Component<Props, State> {
    private feedbackChan?: csp.PopChannel<Feedback | undefined>;
    private readonly feedbackRef = createRef<FeedbackUI>();

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    public render() {
        return (
            <FeedbackUI ref={this.feedbackRef}>
                Task
                <span className={styles.Highlight}>#{this.state.task?.id}</span>
                is updated.
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
                if (feedback.type === 'TaskUpdated') {
                    this.setState({
                        task: feedback.task,
                    });
                    this.feedbackRef.current?.show();
                }
            }
        })().then();
    }

    public componentWillUnmount() {
        this.feedbackChan?.close();
    }
}
