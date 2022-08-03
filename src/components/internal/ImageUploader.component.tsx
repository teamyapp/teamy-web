import React, { ChangeEvent, Component, Fragment } from 'react';
import styles from './ImageUploader.component.module.scss';
import {Progress} from '@lib/fileUpload/progress';
import { Deps } from '@core/dep/deps';
import { FileUploadSessionFactory } from '@lib/fileUpload/fileUploadSession';

interface Props {
    deps: Deps;
    uploadLabel: string;
    onFileUploadInit: () => Promise<number>;
    onFileUploadFinished: (fileUploadSessionId: number) => Promise<void>;
    imageAlt?: string;
    profileUrl?: string;
    defaultProfileName?: string;
}

interface State {
    isPreviewingProfileImage: boolean;
    previewProfileImageUrl?: string;
    profileUploadProgress: Progress;
}

export class ImageUploaderComponent extends Component<Props, State> {
    private readonly fileUploadSessionFactory: FileUploadSessionFactory;

    constructor(props: Props) {
        super(props);
        this.fileUploadSessionFactory = props.deps.fileUploadSessionFactory;
        this.state = {
            isPreviewingProfileImage: false,
            profileUploadProgress: {
                newBytesUploaded: 0,
                totalPercentage: 0,
            },
        };
    }

    private renderProfilePreview() {
        return (
            <Fragment>
                <img
                    alt={this.props.imageAlt}
                    className={styles.UserProfileImg}
                    src={this.state.previewProfileImageUrl}
                />
                <div
                    className={styles.UploadProgress}
                    style={{
                        top: `${this.state.profileUploadProgress.totalPercentage}%`,
                    }}
                />
            </Fragment>
        );
    }

    private renderActiveProfile() {
        return (
            <Fragment>
                {this.props.profileUrl ? (
                    <img
                        alt={this.props.imageAlt}
                        className={styles.ProfileImg}
                        src={this.props.profileUrl}
                    />
                ) : (
                    <div className={styles.DefaultProfile}>
                        {this.props.defaultProfileName || ""}
                    </div>
                )}
                <div className={styles.UploadProfileButton}>
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
        const ratio = image.width / image.height;
        if (ratio !== 1) {
            alert('Profile image need to be a square');
            return;
        }

        if (image.width > 800) {
            alert(
                'Profile image need to be smaller than or equal to 800 x 800',
            );
            return;
        }

        const fileUploadSessionId = await this.props.onFileUploadInit()

        this.setState({
            isPreviewingProfileImage: true,
            previewProfileImageUrl: previewImageUrl,
            profileUploadProgress: {
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
                    profileUploadProgress: progress,
                });
            }
        })().then();
        const error = await uploadSession.uploadFile(file);
        if (error) {
            alert('Fail to upload profile image');
        } else {
            await this.props.onFileUploadFinished(fileUploadSessionId)
        }

        this.setState({
            isPreviewingProfileImage: false,
        });
    };

    public render(): React.ReactNode {
        return (
            <div className={styles.imageUploader}>
                {
                    this.state.isPreviewingProfileImage ?
                        this.renderProfilePreview() :
                        this.renderActiveProfile()
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