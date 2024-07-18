import { Component, createRef } from 'react';
import { ModalUI } from '@lib/ui/Modal';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import styles from './PreviewAttachmentModal.component.module.scss';
import { Attachment } from '@core/entity/attachment';
import { TooltipUI } from '@lib/ui/Tooltip';
import { RelativeLayout } from '@lib/layout';

export const PREVIEW_ATTACHMENT_DIMENSIONS = {
    modalWidth: 90, // in Viewport Wdith
    modalHeight: 85, // in Viewport Height
};

interface Props {
    attachments: Attachment[];
    relativeLayout: RelativeLayout;
}

interface State {
    attachment?: Attachment;
    attachmentLoading?: boolean;
    attachmentLoaded?: boolean;
    containerWidth?: number;
    containerHeight?: number;
    errorMessage?: string;
    attachmentIndex?: number;
}

export class PreviewAttachemntModalComponent extends Component<Props, State> {
    private readonly modalRef = createRef<ModalUI>();

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    public render() {
        return (
            <ModalUI ref={this.modalRef} level={2}>
                <div className={styles.Header}>
                    Attachment Preview
                    <div
                        role={'button'}
                        aria-label={'Close'}
                        className={styles.CloseButton}
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div
                    className={styles.PreviewAttachmentContainer}
                    style={{
                        width: `${this.state.containerWidth}vw`,
                        height: `${this.state.containerHeight}vh`,
                    }}
                >
                    {this.renderPreviewContent()}
                    {this.renderNavigationButtons()}
                </div>
            </ModalUI>
        );
    }

    public open = (attachment: Attachment, index: number) => {
        this.showAttachment(attachment, index);
        this.modalRef.current?.open();
    };

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private renderPreviewContent() {
        const {
            attachment,
            errorMessage,
            attachmentLoaded,
            attachmentLoading,
        } = this.state;

        if (errorMessage) {
            return <p className={styles.Placeholder}>{errorMessage}</p>;
        }

        switch (attachment?.type) {
            case 'IMAGE':
                if (attachmentLoading) {
                    return <p className={styles.Placeholder}>Loading...</p>;
                }

                if (attachmentLoaded) {
                    return (
                        <img
                            src={attachment?.url}
                            className={styles.PreviewImage}
                            alt='Preview'
                        />
                    );
                }

                return (
                    <p className={styles.Placeholder}>Failed to load image.</p>
                );
            default:
                return (
                    <p className={styles.Placeholder}>
                        Unsupported attachment type.
                    </p>
                );
        }
    }

    private loadImage = (url: string) => {
        const image = new Image();
        image.src = url;
        image.onload = () => {
            this.setState({
                attachmentLoaded: true,
                attachmentLoading: false,
            });
        };

        image.onerror = (error) => {
            this.setState({
                attachmentLoaded: false,
                attachmentLoading: false,
                errorMessage: 'Failed to load image.',
            });
            console.error('Error loading image:', error);
        };
    };

    private renderNavigationButtons() {
        const { attachmentIndex } = this.state;
        const { attachments } = this.props;

        return (
            <>
                {attachmentIndex !== undefined &&
                attachmentIndex > 0 && (
                    <div
                        role='button'
                        aria-label='Previous'
                        className={`${styles.PrevButton} `}
                        onClick={this.onPreviousClick}
                    >
                        <TooltipUI
                            message='Previous'
                            verticalAlignment={'center'}
                            horizontalAlignment={'right'}
                            relativeLayout={this.props.relativeLayout}
                        >
                            <MaterialIconUI>chevron_left</MaterialIconUI>
                        </TooltipUI>
                    </div>
                )}
                {attachmentIndex !== undefined &&
                    attachmentIndex < attachments.length - 1 && (
                        <div
                            role='button'
                            aria-label='Next'
                            className={`${styles.NextButton} `}
                            onClick={this.onNextClick}
                        >
                            <TooltipUI
                                message='Next'
                                verticalAlignment={'center'}
                                horizontalAlignment={'left'}
                                relativeLayout={this.props.relativeLayout}
                            >
                                <MaterialIconUI>chevron_right</MaterialIconUI>
                            </TooltipUI>
                        </div>
                    )}
            </>
        );
    }

    private onPreviousClick = () => {
        const { attachmentIndex } = this.state;
        const { attachments } = this.props;

        const newIndex = attachmentIndex! - 1;
        const newAttachment = attachments[newIndex];
        this.showAttachment(newAttachment, newIndex);
    };

    private onNextClick = () => {
        const { attachmentIndex } = this.state;
        const { attachments } = this.props;

        const newIndex = attachmentIndex! + 1;
        const newAttachment = attachments[newIndex];
        this.showAttachment(newAttachment, newIndex);
    };

    private showAttachment = (attachment: Attachment, index: number) => {
        const { modalWidth, modalHeight } = PREVIEW_ATTACHMENT_DIMENSIONS;

        this.setState({
            attachmentLoaded: false,
            attachmentLoading: true,
            containerWidth: modalWidth,
            containerHeight: modalHeight,
            errorMessage: '',
            attachmentIndex: index,
        });

        switch (attachment.type) {
            case 'IMAGE':
                this.loadImage(attachment.url);
                break;
            default:
                return;
        }

        this.setState({
            attachment: attachment
        });
    };
}
