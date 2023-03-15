import React, { ChangeEvent, Component,  } from 'react';

import { FileUploadSessionFactory } from '@lib/fileUpload/fileUploadSession';
import { Progress } from '@lib/fileUpload/progress';

import styles from './ImageUploader.component.module.scss';

interface Props {
    fileUploadSessionFactory: FileUploadSessionFactory;
    uploadButtonLabel: string;
    imageAlt?: string;
    activeImageUrl?: string;
    emptyImagePlaceholder?: string;
    createRemoteFileUploadSession: () => Promise<number>;
    onFileUploadFinished?: (fileUploadSessionId: number) => Promise<void>;
    validateNewImage?: (image: HTMLImageElement) => boolean;
}

interface State {
    showPreview: boolean;
    previewImageUrl?: string;
    uploadProgress: Progress;
}

export class ImageUploaderComponent extends Component<Props, State> {
    private readonly fileUploadSessionFactory: FileUploadSessionFactory;

    constructor(props: Props) {
        super(props);
        this.fileUploadSessionFactory = props.fileUploadSessionFactory;
        this.state = {
            showPreview: false,
            uploadProgress: {
                newBytesUploaded: 0,
                totalPercentage: 0,
            },
        };
    }

    public render(): React.ReactNode {
        return (
            <div className={styles.ImageUploader}>
                {this.state.showPreview
                    ? this.renderPreview()
                    : this.renderActiveImage()}
            </div>
        );
    }

    private renderPreview() {
        return (
            <>
                <img
                    alt={this.props.imageAlt}
                    className={styles.ActiveImg}
                    src={this.state.previewImageUrl}
                />
                <div
                    className={styles.UploadProgress}
                    style={{
                        top: `${this.state.uploadProgress.totalPercentage}%`,
                    }}
                />
            </>
        );
    }

    private renderActiveImage() {
        return (
            <>
                {this.props.activeImageUrl ? (
                    <img
                        alt={this.props.imageAlt}
                        className={styles.ActiveImg}
                        src={this.props.activeImageUrl}
                    />
                ) : (
                    <div className={styles.Placeholder}>
                        {this.props.emptyImagePlaceholder || ''}
                    </div>
                )}
                <div className={styles.UploadButton}>
                    <input
                        type={'file'}
                        className={styles.FileInput}
                        title=''
                        accept='image/png,image/jpeg,image/bmp,image/svg+xml'
                        onChange={this.onProfileImageChange}
                    />
                    <div className={styles.Label}>
                        {this.props.uploadButtonLabel}
                    </div>
                </div>
            </>
        );
    }

    private onProfileImageChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const files = event.target.files;
        if (!files || files.length < 1) {
            return;
        }

        const file = files[0];
        const previewImageUrl = URL.createObjectURL(file);
        const image = await loadImage(previewImageUrl);
        if (
            this.props.validateNewImage &&
            !this.props.validateNewImage.call(null, image)
        ) {
            return;
        }

        const fileUploadSessionId =
            await this.props.createRemoteFileUploadSession();
        this.setState({
            showPreview: true,
            previewImageUrl: previewImageUrl,
            uploadProgress: {
                newBytesUploaded: 0,
                totalPercentage: 0,
            },
        });

        const uploadSession =
            this.fileUploadSessionFactory.createFileUploadSession(
                fileUploadSessionId,
            );
        const onNewProgressCh = uploadSession.subscribeNewProgress();
        (async () => {
            while (true) {
                const progress = await onNewProgressCh.pop();
                if (progress === undefined) {
                    return;
                }

                this.setState({
                    uploadProgress: progress,
                });
            }
        })().then();
        const error = await uploadSession.uploadFile(file);
        if (error) {
            alert('Fail to upload image');
        } else {
            await this.props.onFileUploadFinished?.call(
                null,
                fileUploadSessionId,
            );
        }

        this.setState({
            showPreview: false,
        });
    };
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image);
        };
        image.src = url;
    });
}
