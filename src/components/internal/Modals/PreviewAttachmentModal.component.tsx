import { Component, createRef, useState } from 'react';
import { ModalUI } from '@lib/ui/Modal';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import styles from './PreviewAttachmentModal.component.module.scss';

export const previewAttachmentModalConfig = {
    minScreenWidth: 30, // in vw
    minScreenHeight: 20, // in vh
    maxScreenWidth: 90, // in vw
    maxScreenHeight: 80, // in vh
};

interface Props {}

interface State {
    previewAttachmentUrl?: string;
    previewAttachmentType?: string;
    imageUrlLoaded?: boolean;
    imageWidth?: number;
    imageHeight?: number;
    containerWidth?: number;
    containerHeight?: number;
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
                    style={this.getPreviewContainerWidthAndHeightStyle()}
                >
                    {this.renderPreviewContent()}
                </div>
            </ModalUI>
        );
    }

    public open = (url: string, type: string) => {
        this.setState(
            {
                previewAttachmentUrl: url,
                previewAttachmentType: type,
                imageUrlLoaded: false,
            },
            () => {
                switch (type) {
                    case 'IMAGE':
                        this.loadImage(url);
                        break;
                    default:
                        return;
                }
            },
        );
        this.modalRef.current?.open();
    };

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private renderPreviewContent() {
        const { previewAttachmentUrl, previewAttachmentType } = this.state;
        switch (previewAttachmentType) {
            case 'IMAGE':
                return this.state.imageUrlLoaded ? (
                    <img
                        src={previewAttachmentUrl}
                        className={styles.PreviewImage}
                        alt='Preview'
                    />
                ) : (
                    <img
                        src={''} // Replace with your placeholder image URL or leave empty
                        className={styles.PreviewImage}
                        alt='Please try again later.'
                    />
                );
            default:
                return <p>Unsupported attachment type.</p>;
        }
    }

    private loadImage = (url: string) => {
        const image = new Image();
        image.src = url;
        image.onload = () => {
            this.setState({
                imageWidth: image.naturalWidth,
                imageHeight: image.naturalHeight,
                imageUrlLoaded: true,
            });
        };
        this.adjustPreviewContainerSize(
            image.naturalWidth,
            image.naturalHeight,
        );
        image.onerror = (error) => {
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
        } = previewAttachmentModalConfig;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let imageWidthVW = (imageWidth / viewportWidth) * 100;
        let imageHeightVH = (imageHeight / viewportHeight) * 100;

        let containerWidth;
        let containerHeight;
        // Adjust width and height based on min and max constraints
        if (
            imageWidthVW <= minScreenWidth &&
            imageHeightVH <= minScreenHeight
        ) {
            containerWidth = minScreenWidth;
            containerHeight = minScreenHeight;
        } else if (
            imageWidthVW >= maxScreenWidth &&
            imageHeightVH >= maxScreenHeight
        ) {
            containerWidth = maxScreenWidth;
            containerHeight = maxScreenHeight;
        } else if (
            imageWidthVW >= maxScreenWidth ||
            imageHeightVH >= maxScreenHeight
        ) {
            containerWidth = maxScreenWidth;
            containerHeight = maxScreenHeight;
        } else {
            containerWidth = imageWidthVW;
            containerHeight = imageHeightVH;
        }
        this.setState({
            containerWidth: containerWidth,
            containerHeight: containerHeight,
        });
    };

    private getPreviewContainerWidthAndHeightStyle = () => {
        const { containerWidth, containerHeight } = this.state;
        return { width: containerWidth + 'vw', height: containerHeight + 'vh' };
    };
}
