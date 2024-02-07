import { RenderFunc } from '@teamyapp/ext';
import React, { Component, createRef } from 'react';

import { FeedbackUI } from './../ui/Feedback';

interface State {
    onFeedbackClose?: () => void;
}

export class TeamyThirdPartyAppFeedbackUI extends Component<any, State> {
    private feedbackUIRef = createRef<FeedbackUI>();
    private contentElRef = createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        this.state = {};
    }

    public render() {
        return (
            <FeedbackUI
                ref={this.feedbackUIRef}
                onFeedbackClose={this.props.onFeedbackClose}
            >
                <div ref={this.contentElRef} />
            </FeedbackUI>
        );
    }

    public show(renderFunc: RenderFunc) {
        if (!this.contentElRef.current) {
            return;
        }

        const cleanup = renderFunc(this.contentElRef.current);
        this.setState({
            onFeedbackClose: cleanup,
        });
        this.feedbackUIRef.current?.show();
    }
}
