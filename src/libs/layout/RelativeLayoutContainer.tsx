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
    onOpenContainer?: () => void;
    onCloseContainer?: () => void;
    onMouseLeave?: () => void;
    zOffset?: number;
    renderReferenceElement: (
        {
            toggleContainer,
            closeContainer,
            openContainer,
            showFollower,
        }: {
            toggleContainer: () => void;
            closeContainer: () => void;
            openContainer: () => void;
            showFollower: boolean;
        }) => ReactNode;
    renderFollower: (
        {
            closeContainer,
            openContainer,
        }: {
            closeContainer: () => void;
            openContainer: () => void;
        }) => ReactNode;
    relativeLayout: RelativeLayout;
    horizontalAlignment?: HorizontalAlignment;
    verticalAlignment?: VerticalAlignment;
    overSpaceAction?: OverSpaceAction;
    referenceOffset?: number;
    preserveReferenceParentHeight?: boolean;
    preserveReferenceParentWidth?: boolean;
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
        document.addEventListener('mousedown', this.onClickOutside);
    }

    componentWillUnmount() {
        document.body.removeChild(this.followerContainer);
        document.removeEventListener('mousedown', this.onClickOutside);
    }

    private onClickOutside = (event: MouseEvent) => {
        if (
            this.referenceElementRef.current &&
            this.followerRef.current &&
            !this.referenceElementRef.current.contains(event.target as Node) &&
            !this.followerRef.current.contains(event.target as Node)
        ) {
            this.onClose();
        }
    };

    render() {
        return (
            <Fragment>
                <div ref={this.referenceElementRef}
                    style={{
                        width: this.props.preserveReferenceParentWidth ? '100%' : 'auto',
                        height: this.props.preserveReferenceParentHeight ? '100%' : 'auto',
                    }}>
                    {this.props.renderReferenceElement({
                        toggleContainer: this.handleToggle,
                        showFollower: this.state.showFollower,
                        closeContainer: this.onClose,
                        openContainer: this.onOpen,
                    })}
                </div>
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
                                closeContainer: this.onClose,
                                openContainer: this.onOpen,
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

        this.props.onCloseContainer?.call(null);
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
                            this.props.referenceOffset,
                        );
                }
            },
        );
        this.props.onOpenContainer?.call(null);
    };

    private handleToggle = () => {
        if (this.state.showFollower) {
            this.onClose();
        } else {
            this.onOpen();
        }
    };
}
