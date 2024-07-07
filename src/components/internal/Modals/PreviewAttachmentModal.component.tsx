import { Component, createRef } from 'react';
import { ModalUI } from '@lib/ui/Modal';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import styles from './PreviewAttachmentModal.component.module.scss';

interface Props {}

interface State {
    previewAttachmentUrl?: string;
    previewAttachmentType?: string;
}

export class PreviewAttachemntModalComponent extends Component<Props, State> {
    private readonly modalRef = createRef<ModalUI>();

    constructor(props: Props) {
        super(props);
        this.state = {
        };
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
                <div className={styles.PreviewAttachmentContainer}>
                    {this.renderPreviewContent()}
                </div>
            </ModalUI>
        );
    }

    public open = (url: string, type: string) => {
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
        const { previewAttachmentUrl, previewAttachmentType } = this.state;

        switch (previewAttachmentType) {
            case 'IMAGE':
                return <img src={previewAttachmentUrl} className={styles.PreviewImage} alt='Preview' />;
            default:
                return <p>Unsupported attachment type.</p>;
        }
    }
}
