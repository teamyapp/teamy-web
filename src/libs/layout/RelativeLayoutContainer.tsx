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
    renderReferenceElement: ({ onToggle }: { onToggle: () => void }) => ReactNode;
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
    overSpaceAction?: OverSpaceAction
    offset?: number,
};

interface States {
    showPopup: boolean;
}

export class RelativeLayoutContainerUI extends Component<Props, States> {
    private readonly popupContainer = document.createElement('div');
    private readonly popupRef = createRef<HTMLDivElement>();
    private readonly triggerRef = createRef<HTMLDivElement>();
    private layoutAttachment?: LayoutAttachment;

    constructor(props: Props) {
        super(props);
        this.state = {
            showPopup: false,
        };
    }

    componentDidMount() {
        document.body.appendChild(this.popupContainer);
    }

    componentWillUnmount() {
        document.body.removeChild(this.popupContainer);
    }

    private onClose = () => {
        this.layoutAttachment?.detach();
        this.setState({
            showPopup: false,
        });

        this.props.onClose?.call(null);
        this.props.onMouseLeave?.call(null);
    };

    private onOpen = () => {
        this.setState(
            {
                showPopup: true,
            },
            () => {
                if (this.popupRef.current && this.triggerRef.current) {
                    this.layoutAttachment =
                        this.props.relativeLayout.attachElements(
                            this.triggerRef.current,
                            this.popupRef.current,
                            this.props.horizontalAlignment,
                            this.props.verticalAlignment,
                            this.props.overSpaceAction,
                            this.props.offset 
                        );
                }
            },
        );
        this.props.onOpen?.call(null);
    };

    private handleToggle = () => {
        if (this.state.showPopup) {
            this.onClose();
        } else {
            this.onOpen();
        }
    };

    render() {
        return (
            <Fragment>
                <span ref={this.triggerRef}>
                    {this.props.renderReferenceElement({ onToggle: this.handleToggle })}
                </span>
                {this.state.showPopup && this.popupRef && createPortal(
                    (
                        <div
                            ref={this.popupRef}
                            style={{
                                position: 'absolute',
                                zIndex: (this.props.zOffset || 0) + 1,
                            }}
                        >
                            {this.props.renderPopup({
                                onClose: this.onClose,
                                onOpen: this.onOpen,
                            })}
                        </div>
                    ),
                    this.popupContainer,
                )}
            </Fragment>
        );
    }
}
