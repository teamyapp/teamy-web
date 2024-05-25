import { FeedbackUI } from "@lib/ui/Feedback";
import { FC, createRef, useState } from "react";
import { Deps } from "@core/dep/deps";
import styles from './feedback.module.scss';
export interface Props {
    deps: Deps;
}

export const CopiedFeedbackComponent: FC<Props> = (props: Props) => {
    const feedbackRef = createRef<FeedbackUI>();
    const feedbackChan = props.deps.feedbackPubSub.subscribe();
    const [content, setContent] = useState<string>();
    (async () => {
        while (true) {
            const feedback = await feedbackChan?.pop();
            if (feedback === undefined) {
                return;
            }

            if (feedback.type === 'Copied') {
                setContent(feedback.content);
                feedbackRef.current?.show();
            } else {
                feedbackRef.current?.hide();
            }
        }
    })().then();

    return (
        <FeedbackUI ref={feedbackRef}>
            <span className={styles.Highlight}>{content}</span>
            is copied in the clipboard.
        </FeedbackUI>
    );
}