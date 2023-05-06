import React, { Component, ReactNode } from 'react';

import { FeedbackUI } from './Feedback';

interface State {
    children?: ReactNode;
    actionLabel?: string;
    onActionClick?: () => void;
}

export class DynamicFeedbackUI extends Component<any, State> {
    private feedbackUIRef = React.createRef<FeedbackUI>();

    constructor(props: any) {
        super(props);
        this.state = {};
    }

    public render() {
        return (
            <FeedbackUI
                ref={this.feedbackUIRef}
                children={this.state.children}
                actionLabel={this.state.actionLabel}
                onActionClick={this.state.onActionClick}
            />
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
