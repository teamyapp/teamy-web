import classNames from 'classnames';
import { marked, MarkedOptions } from 'marked';
import prismjs from 'prismjs';
import React, { ClipboardEvent, Component, FormEvent, ReactNode } from 'react';
import { FileUploadSessionFactory } from '@lib/fileUpload/fileUploadSession';
import { MaterialIconUI } from './MaterialIcon';
import { Attachment } from '@core/entity/attachment';
import './VSCode.theme.scss';
import styles from './MarkdownEditor.module.scss';
import { Deps } from '@core/dep/deps';
import { AttachmentList } from './AttachmentList';

interface CustomMarkedOptions extends MarkedOptions {
    highlight?: (code: string, lang: string) => string;
}

const renderer = new marked.Renderer();

const options: CustomMarkedOptions = {
    renderer,
    highlight: function (code: string, language: string) {
        try {
            return prismjs.highlight(
                code,
                prismjs.languages[language],
                language,
            );
        } catch {
            return code;
        }
    },
};

marked.setOptions(options);

interface Props {
    deps: Deps;
    label?: string;
    content?: string;
    attachments: Attachment[];
    fileUploadSessionFactory: FileUploadSessionFactory;
    onDeleteAttachment: (attachmentId: number) => void;
    onCopyAttachmentLink: (url: string) => void;
    createRemoteFileUploadSession: () => Promise<number>;
    onFileUploadFinished: (fileUploadSessionId: number) => Promise<{
        id: string;
        url: string;
    }>;
    onContentUpdated: () => void;
}

interface State {
    focus: boolean;
    content: string;
    inEditMode: boolean;
    uploadProgress?: {
        newBytesUploaded: number;
        totalPercentage: number;
    };
}

export class MarkdownEditorUI extends Component<Props, State> {
    private readonly fileUploadSessionFactory: FileUploadSessionFactory;
    private readonly textareaRef = React.createRef<HTMLTextAreaElement>();

    constructor(props: Props) {
        super(props);
        this.fileUploadSessionFactory = props.fileUploadSessionFactory;
        this.state = {
            focus: false,
            inEditMode: false,
            content: this.props.content || '',
        };
    }

    public get content() {
        return this.state.content;
    }

    render(): ReactNode {
        return (
            <>
                <div
                    aria-label={'markdown editor'}
                    className={`${styles.MarkdownEditor} ${classNames({
                        [styles.Focus]: this.state.focus,
                    })}`}
                >
                    <div className={styles.Toolbar}>
                        {this.props.label}
                        <div className={styles.Spacer} />
                        <div className={styles.Mode}>
                            <div
                                className={`${styles.Button} ${classNames({
                                    [styles.Enabled]: !this.state.inEditMode,
                                })}`}
                                onClick={this.onPreviewModeButtonClick}
                            >
                                <MaterialIconUI>image</MaterialIconUI>
                            </div>
                            <div
                                className={`${styles.Button} ${classNames({
                                    [styles.Enabled]: this.state.inEditMode,
                                })}`}
                                onClick={this.onEditModeButtonClick}
                            >
                                <MaterialIconUI>notes</MaterialIconUI>
                            </div>
                        </div>
                    </div>
                    <div className={styles.Content}>
                        {this.state.inEditMode ? (
                            <textarea
                                ref={this.textareaRef}
                                className={styles.TextArea}
                                value={this.state.content}
                                onChange={this.onTextAreaContentChange}
                                onFocus={this.onTextAreaFocus}
                                onBlur={this.onTextAreaBlur}
                                onPaste={this.onPaste}
                            />
                        ) : (
                            <div className={styles.Preview}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: marked(this.state.content),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                {this.props.attachments && (
                    <AttachmentList
                        attachments={this.props.attachments}
                        relativeLayout={this.props.deps.relativeLayout}
                        onDeleteAttachment={this.props.onDeleteAttachment}
                        onCopyAttachmentLink={this.props.onCopyAttachmentLink}
                    />
                )}
                {this.state.uploadProgress && (
                    <div className={styles.UploadProgress}>
                        <div className={styles.LeftSection}>
                            <div className={styles.ImagePlaceholder}>
                                <div
                                    className={styles.Progress}
                                    style={{
                                        height: `${this.state.uploadProgress.totalPercentage}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className={styles.RightSection}>
                            <div className={styles.NamePlaceholder}></div>
                            <div className={styles.DatePlaceholder}></div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    private onPaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
        const items = event.clipboardData?.items;
        if (!items) {
            return;
        }

        const file = Array.from(items)
            .find((item) => item.kind === 'file')
            ?.getAsFile();
        if (!file) {
            return;
        }

        const fileUploadSessionId =
            await this.props.createRemoteFileUploadSession();

        const uploadSession =
            this.fileUploadSessionFactory.createFileUploadSession(
                fileUploadSessionId,
            );

        const onNewProgressCh = uploadSession.subscribeNewProgress();
        let start = this.textareaRef.current?.selectionStart;
        let end = this.textareaRef.current?.selectionEnd;
        let content = this.state.content;
        const newContent = `${content.slice(0, start)}![Uploading...]${content.slice(end)}`;
        this.setState({
            content: newContent,
        });

        (async () => {
            while (true) {
                const progress = await onNewProgressCh.pop();
                if (progress === undefined) {
                    this.setState({
                        uploadProgress: undefined,
                    });
                    return;
                }

                this.setState({
                    uploadProgress: progress,
                });
            }
        })().then();
        const error = await uploadSession.uploadFile(file);
        if (error) {
            this.props.deps.feedbackPubSub.publish({
                type: 'Error',
                children: 'Fail to upload image',
            });
            return;
        }

        const { id, url } =
            await this.props.onFileUploadFinished(fileUploadSessionId);
        this.setState(() => {
            const newContent = `${content.slice(0, start)}![${id}](${url})${content.slice(end)}`;

            return {
                content: newContent,
            };
        }, this.props.onContentUpdated);
    };

    private onTextAreaContentChange = (
        event: FormEvent<HTMLTextAreaElement>,
    ) => {
        this.setState({
            content: event.currentTarget.value,
        });
    };

    private onTextAreaFocus = () => {
        this.setState({
            focus: true,
        });
    };

    private onEditModeButtonClick = () => {
        this.setState({
            inEditMode: true,
        });
    };

    private onPreviewModeButtonClick = () => {
        this.setState({
            inEditMode: false,
        });
    };

    private onTextAreaBlur = () => {
        this.setState({
            focus: false,
        });
    };
}
