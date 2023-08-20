import React, { Component, Fragment, ReactNode, createRef } from 'react';
import { createPortal } from 'react-dom';

import {
    HorizontalAlignment,
    LayoutAttachment,
    OverSpaceAction,
    RelativeLayout,
    VerticalAlignment,
} from '@lib/layout/relativeLayout';

type Props = {
    onOpen?: () => void;
    onClose?: () => void;
    onMouseLeave?: () => void;
    zOffset?: number;
    renderReferenceElement: ({
        onToggle,
    }: {
        onToggle: () => void;
    }) => ReactNode;
    renderFollower: ({
        onClose,
        onOpen,
    }: {
        onClose: () => void;
        onOpen: () => void;
    }) => ReactNode;
    relativeLayout: RelativeLayout;
    horizontalAlignment?: HorizontalAlignment;
    verticalAlignment?: VerticalAlignment;
    overSpaceAction?: OverSpaceAction;
    offset?: number;
};

interface States {
    showFollower: boolean;
}

export class RelativeLayoutContainerUI extends Component<Props, States> {
    private readonly followerContainer = document.createElement('div');
    private readonly followerRef = createRef<HTMLDivElement>();
    private readonly referenceElementRef = createRef<HTMLDivElement>();
    private layoutAttachment?: LayoutAttachment;

    constructor(props: Props) {
        super(props);
        this.state = {
            showFollower: false,
        };
    }

    componentDidMount() {
        document.body.appendChild(this.followerContainer);
    }

    componentWillUnmount() {
        document.body.removeChild(this.followerContainer);
    }

    render() {
        return (
            <Fragment>
                <span ref={this.referenceElementRef}>
                    {this.props.renderReferenceElement({
                        onToggle: this.handleToggle,
                    })}
                </span>
                {this.state.showFollower &&
                    this.followerRef &&
                    createPortal(
                        <div
                            ref={this.followerRef}
                            style={{
                                position: 'absolute',
                                zIndex: (this.props.zOffset || 0) + 1,
                            }}
                        >
                            {this.props.renderFollower({
                                onClose: this.onClose,
                                onOpen: this.onOpen,
                            })}
                        </div>,
                        this.followerContainer,
                    )}
            </Fragment>
        );
    }

    private onClose = () => {
        this.layoutAttachment?.detach();
        this.setState({
            showFollower: false,
        });

        this.props.onClose?.call(null);
        this.props.onMouseLeave?.call(null);
    };

    private onOpen = () => {
        this.setState(
            {
                showFollower: true,
            },
            () => {
                if (
                    this.followerRef.current &&
                    this.referenceElementRef.current
                ) {
                    this.layoutAttachment =
                        this.props.relativeLayout.attachElements(
                            this.referenceElementRef.current,
                            this.followerRef.current,
                            this.props.horizontalAlignment,
                            this.props.verticalAlignment,
                            this.props.overSpaceAction,
                            this.props.offset,
                        );
                }
            },
        );
        this.props.onOpen?.call(null);
    };

    private handleToggle = () => {
        if (this.state.showFollower) {
            this.onClose();
        } else {
            this.onOpen();
        }
    };
}
