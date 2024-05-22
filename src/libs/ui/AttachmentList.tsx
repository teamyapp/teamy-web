import { Attachment } from "@core/entity/attachment";
import styles from "./AttachmentList.module.scss";
import { timeFromNow } from "@lib/data/format";

interface Props {
    attachments: Attachment[];
}


export const AttachmentList: React.FC<Props> = (props) => {
    const renderName = (attachment: Attachment) => {
        switch (attachment.type) {
            case "IMAGE":
                return `Image: ${attachment.id}`;
            default:
                return `Attachment: ${attachment.id}`;
        }
    };
    return (
        <div className={styles.Attachments}>
            {props.attachments?.map((attachment) => {
                return (
                    <div className={styles.Attachment} key={attachment.id}>
                        <div className={styles.LeftSection}>
                            <div className={styles.Container}>
                            <img key={attachment.id} src={attachment.url} />
                        
    </div>                        </div>
                        <div className={styles.RightSection}>
                            <div className={styles.Name}>{renderName(attachment)}</div>
                            <div className={styles.Date}>
                                {timeFromNow(attachment.createdAt)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
