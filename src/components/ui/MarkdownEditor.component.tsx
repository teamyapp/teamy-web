import classNames from 'classnames';
import marked from 'marked';
import prismjs from 'prismjs';
import { Component, FormEvent, ReactElement } from 'react';

import styles from './MarkdownEditor.component.module.scss';

import MaterialIconComponent from './MaterialIcon.component';
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
}

interface IState {
    focus: boolean;
    content: string;
    inEditMode: boolean;
}

export default class MarkdownEditorComponent extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            focus: false,
            inEditMode: true,
            content: '',
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
                            <MaterialIconComponent>notes</MaterialIconComponent>
                        </div>
                        <div
                            className={`${styles.Button} ${classNames({
                                [styles.Enabled]: !this.state.inEditMode,
                            })}`}
                            onClick={this.onPreviewModeButtonClick}
                        >
                            <MaterialIconComponent>image</MaterialIconComponent>
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
