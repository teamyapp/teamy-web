import classNames from 'classnames';
import {marked} from 'marked';
import prismjs from 'prismjs';
import React, { Component, FormEvent, ReactNode } from 'react';

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

interface Props {
    label?: string;
    content?: string;
}

interface State {
    focus: boolean;
    content: string;
    inEditMode: boolean;
}

export class MarkdownEditorUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            focus: false,
            inEditMode: true,
            content: this.props.content || '',
        };
    }

    public get content() {
        return this.state.content;
    }

    render(): ReactNode {
        return (
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
