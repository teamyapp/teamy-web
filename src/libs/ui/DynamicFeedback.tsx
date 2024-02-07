import React, {Component, createRef, ReactNode} from 'react';

import { FeedbackUI } from './Feedback';

interface State {
    children?: ReactNode;
    actionLabel?: string;
    onActionClick?: () => void;
}

export class DynamicFeedbackUI extends Component<any, State> {
    private feedbackUIRef = createRef<FeedbackUI>();

    constructor(props: any) {
        super(props);
        this.state = {};
    }

    public render() {
        return (
            <FeedbackUI
                ref={this.feedbackUIRef}
                actionLabel={this.state.actionLabel}
                onActionClick={this.state.onActionClick}
            >
                {this.state.children}
            </FeedbackUI>
        );
    }

    public show(
        children?: ReactNode,
        actionLabel?: string,
        onActionClick?: () => void,
    ) {
        this.setState(
            {
                children,
                actionLabel,
                onActionClick,
            },
            () => {
                this.feedbackUIRef.current?.show();
            },
        );
    }
}
