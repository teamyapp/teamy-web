import classNames from 'classnames';
import marked from 'marked';
import prismjs from 'prismjs';
import React, { Component, FormEvent, ReactElement } from 'react';

import styles from './MarkdownEditor.module.scss';
import { MaterialIconUI } from './MaterialIcon';
import './VSCode.theme.scss';

const renderer = new marked.Renderer();
marked.setOptions({
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
});

interface IProps {
    label?: string;
    content?: string;
}

interface IState {
    focus: boolean;
    content: string;
    inEditMode: boolean;
}

export class MarkdownEditorUI extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            focus: false,
            inEditMode: true,
            content: this.props.content || '',
        };
    }

    render(): ReactElement {
        return (
            <div
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
                                [styles.Enabled]: this.state.inEditMode,
                            })}`}
                            onClick={this.onEditModeButtonClick}
                        >
                            <MaterialIconUI>notes</MaterialIconUI>
                        </div>
                        <div
                            className={`${styles.Button} ${classNames({
                                [styles.Enabled]: !this.state.inEditMode,
                            })}`}
                            onClick={this.onPreviewModeButtonClick}
                        >
                            <MaterialIconUI>image</MaterialIconUI>
                        </div>
                    </div>
                </div>
                <div className={styles.Content}>
                    {this.state.inEditMode ? (
                        <textarea
                            className={styles.TextArea}
                            value={this.state.content}
                            onChange={this.onTextAreaContentChange}
                            onFocus={this.onTextAreaFocus}
                            onBlur={this.onTextAreaBlur}
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
        );
    }

    public get content() {
        return this.state.content;
    }

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
