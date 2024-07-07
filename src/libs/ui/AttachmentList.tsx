import { Attachment } from '@core/entity/attachment';
import styles from './AttachmentList.module.scss';
import { timeFromNow } from '@lib/data/format';
import { TooltipUI } from './Tooltip';
import { RelativeLayout } from '@lib/layout';
import { MaterialIconUI } from './MaterialIcon';
import { PreviewAttachemntModalComponent } from 'components/internal/Modals/PreviewAttachmentModal.component';
import { createRef } from 'react';

interface Props {
    attachments: Attachment[];
    relativeLayout: RelativeLayout;
    onDeleteAttachment?: (attachmentId: number) => void;
    onCopyAttachmentLink?: (url: string) => void;
}

export const AttachmentList: React.FC<Props> = (props) => {
    const previewAttachmentModalRef =
        createRef<PreviewAttachemntModalComponent>();

    const renderName = (attachment: Attachment) => {
        switch (attachment.type) {
            case 'IMAGE':
                return `Image: ${attachment.id}`;
            default:
                return `Attachment: ${attachment.id}`;
        }
    };

    const handleDeleteAttachment = (attachmentId: number) => () => {
        if (props.onDeleteAttachment) {
            props.onDeleteAttachment(attachmentId);
        }
    };

    const handleCopyAttachmentLink = (url: string) => () => {
        if (props.onCopyAttachmentLink) {
            props.onCopyAttachmentLink(url);
        }
    };

    const handlePreviewAttachment = (attachment: Attachment) => () => {
        previewAttachmentModalRef.current?.open(
            attachment.url,
            attachment.type,
        );
    };

    return (
        <>
            <div className={styles.Attachments}>
                {props.attachments?.map((attachment) => {
                    return (
                        <div className={styles.Attachment} key={attachment.id}>
                            <div
                                className={styles.LeftSection}
                                onClick={handlePreviewAttachment(attachment)}
                            >
                                <div className={styles.Container}>
                                    <img
                                        key={attachment.id}
                                        src={attachment.url}
                                    />
                                </div>{' '}
                            </div>
                            <div className={styles.RightSection}>
                                <div className={styles.Info}>
                                    <div className={styles.Name}>
                                        {renderName(attachment)}
                                    </div>
                                    <div className={styles.Date}>
                                        {timeFromNow(attachment.createdAt)}
                                    </div>
                                </div>
                                <div className={styles.Actions}>
                                    <TooltipUI
                                        relativeLayout={props.relativeLayout}
                                        message='Delete'
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Delete}`}
                                            onClick={handleDeleteAttachment(
                                                attachment.id,
                                            )}
                                        >
                                            <MaterialIconUI>
                                                remove
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>

                                    <TooltipUI
                                        relativeLayout={props.relativeLayout}
                                        message='Copy link'
                                    >
                                        <div
                                            className={`${styles.Action} ${styles.Copy}`}
                                            onClick={handleCopyAttachmentLink(
                                                attachment.url,
                                            )}
                                        >
                                            <MaterialIconUI>
                                                content_copy
                                            </MaterialIconUI>
                                        </div>
                                    </TooltipUI>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <PreviewAttachemntModalComponent ref={previewAttachmentModalRef} />
        </>
    );
};
