import { Component, createRef } from 'react';
import { ModalUI } from '@lib/ui/Modal';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import styles from './PreviewAttachmentModal.component.module.scss';
import { Attachment } from '@core/entity/attachment';

export const PREVIEW_ATTACHMENT_DIMENSIONS = {
    screenWidth: 90, // in Viewport Wdith
    screenHeight: 85, // in Viewport Height
};

interface Props {
    attachments: Attachment[];
}

interface State {
    previewAttachmentUrl?: string;
    previewAttachmentType?: string;
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

    public open = (url: string, type: string, index: number) => {
        const { screenWidth, screenHeight } = PREVIEW_ATTACHMENT_DIMENSIONS;
        this.setState({
            attachmentLoaded: false,
            attachmentLoading: true,
            containerWidth: screenWidth,
            containerHeight: screenHeight,
            errorMessage: '',
            attachmentIndex: index,
        });

        switch (type) {
            case 'IMAGE':
                this.loadImage(url);
                break;
            default:
                return;
        }

        this.setState({
            previewAttachmentUrl: url,
            previewAttachmentType: type,
        });
        this.modalRef.current?.open();
    };

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private renderPreviewContent() {
        const {
            previewAttachmentUrl,
            previewAttachmentType,
            errorMessage,
            attachmentLoaded,
            attachmentLoading,
        } = this.state;

        if (errorMessage) {
            return <p className={styles.ContainerText}>{errorMessage}</p>;
        }

        switch (previewAttachmentType) {
            case 'IMAGE':
                if (attachmentLoading) {
                    return <p className={styles.ContainerText}>Loading...</p>;
                }

                if (attachmentLoaded) {
                    return (
                        <img
                            src={previewAttachmentUrl}
                            className={styles.PreviewImage}
                            alt='Preview'
                        />
                    );
                }
                return (
                    <p className={styles.ContainerText}>
                        Image failed to load.
                    </p>
                );
            default:
                return (
                    <p className={styles.ContainerText}>
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
                errorMessage: 'Image failed to load.',
            });
            console.error('Error loading image:', error);
        };
    };

    private renderNavigationButtons() {
        const { attachmentIndex } = this.state;
        const { attachments } = this.props;

        return (
            <>
                {attachmentIndex !== undefined && attachmentIndex > 0 && (
                    <div
                        role='button'
                        aria-label='Previous'
                        className={styles.PrevButton}
                        onClick={this.onPrevAttachment}
                    >
                        <span className={styles.TooltipText}>Previous</span>
                        <MaterialIconUI>chevron_left</MaterialIconUI>
                    </div>
                )}
                {attachmentIndex !== undefined &&
                    attachmentIndex < attachments.length - 1 && (
                        <div
                            role='button'
                            aria-label='Next'
                            className={styles.NextButton}
                            onClick={this.onNextAttachment}
                        >
                            <span className={styles.TooltipText}>Next</span>
                            <MaterialIconUI>chevron_right</MaterialIconUI>
                        </div>
                    )}
            </>
        );
    }

    private onPrevAttachment = () => {
        const { attachmentIndex } = this.state;
        const { attachments } = this.props;
        if (attachmentIndex !== undefined && attachmentIndex > 0) {
            const newIndex = attachmentIndex - 1;
            const newAttachment = attachments[newIndex];
            this.open(newAttachment.url, newAttachment.type, newIndex);
        }
    };

    private onNextAttachment = () => {
        const { attachmentIndex } = this.state;
        const { attachments } = this.props;
        if (
            attachmentIndex !== undefined &&
            attachmentIndex < attachments.length - 1
        ) {
            const newIndex = attachmentIndex + 1;
            const newAttachment = attachments[newIndex];
            this.open(newAttachment.url, newAttachment.type, newIndex);
        }
    };
}
