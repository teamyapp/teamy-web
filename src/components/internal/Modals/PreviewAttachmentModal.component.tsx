import { Component, createRef } from 'react';
import { ModalUI } from '@lib/ui/Modal';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import styles from './PreviewAttachmentModal.component.module.scss';

export const PREVIEW_ATTACHMENT_DIMENSIONS = {
    minScreenWidth: 30, // in Viewport Wdith
    minScreenHeight: 20, // in Viewport Height
    maxScreenWidth: 90, // in Viewport Wdith
    maxScreenHeight: 80, // in Viewport Height
};

interface Props {}

interface State {
    previewAttachmentUrl?: string;
    previewAttachmentType?: string;
    attachmentLoading?: boolean;
    attachmentLoaded?: boolean;
    containerWidth?: number;
    containerHeight?: number;
    errorMessage?: string;
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
                </div>
            </ModalUI>
        );
    }

    public open = (url: string, type: string) => {
        const { minScreenWidth, minScreenHeight } = PREVIEW_ATTACHMENT_DIMENSIONS;
        this.setState({
            attachmentLoaded: false,
            attachmentLoading: true,
            containerWidth: minScreenWidth,
            containerHeight: minScreenHeight,
            errorMessage: '',
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
            return <p>{errorMessage}</p>;
        }

        switch (previewAttachmentType) {
            case 'IMAGE':
                if (attachmentLoading) {
                    return <p>Loading...</p>;
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
                return <p>Image failed to load.</p>;
            default:
                return <p>Unsupported attachment type.</p>;
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
            this.adjustPreviewContainerSize(
                image.naturalWidth,
                image.naturalHeight,
            );
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

    private adjustPreviewContainerSize = (
        imageWidth: number,
        imageHeight: number,
    ) => {
        const {
            minScreenWidth,
            minScreenHeight,
            maxScreenWidth,
            maxScreenHeight,
        } = PREVIEW_ATTACHMENT_DIMENSIONS;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let imageWidthViewportWidth = (imageWidth / viewportWidth) * 100;
        let imageHeightViewportWidth = (imageHeight / viewportHeight) * 100;

        let containerWidth = Math.max(imageWidthViewportWidth, minScreenWidth);
        containerWidth = Math.min(containerWidth, maxScreenWidth);

        let containerHeight = Math.max(imageHeightViewportWidth, minScreenHeight);
        containerHeight = Math.min(containerHeight, maxScreenHeight);

        this.setState({
            containerWidth: containerWidth,
            containerHeight: containerHeight,
        });
    };
}
