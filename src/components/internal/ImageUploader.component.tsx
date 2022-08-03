import React, { ChangeEvent, Component, Fragment } from 'react';
import styles from './ImageUploader.component.module.scss';
import {Progress} from '@lib/fileUpload/progress';
import { FileUploadSessionFactory } from '@lib/fileUpload/fileUploadSession';

interface Props {
    fileUploadSessionFactory: FileUploadSessionFactory;
    uploadLabel: string;
    onFileUploadInit: () => Promise<number>;
    onFileUploadFinished: (fileUploadSessionId: number) => Promise<void>;
    imageValidator?: (image: HTMLImageElement) => boolean;
    imageAlt?: string;
    imageUrl?: string;
    placeholder?: string;
}

interface State {
    isPreviewingImage: boolean;
    previewImageUrl?: string;
    uploadProgress: Progress;
}

export class ImageUploaderComponent extends Component<Props, State> {
    private readonly fileUploadSessionFactory: FileUploadSessionFactory;

    constructor(props: Props) {
        super(props);
        this.fileUploadSessionFactory = props.fileUploadSessionFactory;
        this.state = {
            isPreviewingImage: false,
            uploadProgress: {
                newBytesUploaded: 0,
                totalPercentage: 0,
            },
        };
    }

    private renderPreview() {
        return (
            <Fragment>
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
            </Fragment>
        );
    }

    private renderActiveImage() {
        return (
            <Fragment>
                {this.props.imageUrl ? (
                    <img
                        alt={this.props.imageAlt}
                        className={styles.ActiveImg}
                        src={this.props.imageUrl}
                    />
                ) : (
                    <div className={styles.Placeholder}>
                        {this.props.placeholder || ""}
                    </div>
                )}
                <div className={styles.UploadButton}>
                    <input
                        type={'file'}
                        className={styles.FileInput}
                        title=""
                        accept="image/png,image/jpeg,image/bmp,image/svg+xml"
                        onChange={this.onProfileImageChange}
                    />
                    <div className={styles.Label}>{this.props.uploadLabel}</div>
                </div>
            </Fragment>
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

        if (this.props.imageValidator && !this.props.imageValidator.call(this, image)) {
            return
        }

        const fileUploadSessionId = await this.props.onFileUploadInit()

        this.setState({
            isPreviewingImage: true,
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
            await this.props.onFileUploadFinished(fileUploadSessionId)
        }

        this.setState({
            isPreviewingImage: false,
        });
    };

    public render(): React.ReactNode {
        return (
            <div className={styles.ImageUploader}>
                {
                    this.state.isPreviewingImage ?
                        this.renderPreview() :
                        this.renderActiveImage()
                }
            </div>
        )
    }

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