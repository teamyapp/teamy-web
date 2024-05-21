import { Attachment } from "@core/entity/attachment";
import styles from "./AttachmentList.module.scss";
import { timeFromNow } from "@lib/data/format";

interface Props {
    attachments: Attachment[];
}


export const AttachmentList: React.FC<Props> = (props) => {
    return (
        <div className={styles.Attachments}>
            {props.attachments?.map((attachment) => {
                return (
                    <div className={styles.Attachment} key={attachment.id}>
                        <div className={styles.LeftSection}>
                            <img key={attachment.id} src={attachment.url} />
                        </div>
                        <div className={styles.RightSection}>
                            <div className={styles.Name}>{attachment.id}</div>
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
