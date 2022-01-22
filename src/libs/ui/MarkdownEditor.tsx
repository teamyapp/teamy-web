import classNames from 'classnames';
import marked from 'marked';
import prismjs from 'prismjs';
import React, { Component, FormEvent, ReactElement } from 'react';

import styles from './MarkdownEditor.module.scss';
import { MaterialIconUI } from './MaterialIcon';
import './VSCode.theme.scss';
import * as csp from '@lib/csp/csp'
import _ from 'lodash';
import { EEXIST } from 'constants';

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

// window.onkeydown = async function (e) {
//     console.log(e.key, e.ctrlKey)
//     if (e.key === 'v' && e.ctrlKey) {
//         // replace clipboard image
//         let items = await navigator.clipboard.read()
//         for (let item of items) {
//             console.log(item.types);
//             let image = await item.getType("image/png");
//             // console.log()
//             // image.
//             // let t = await image.text()
//             const reader = new FileReader();
//             reader.readAsDataURL(image);
//             reader.addEventListener("load", function () {
//                 // convert image file to base64 string
//                 if (reader.result) {
//                     navigator.clipboard.writeText(String(reader.result))
//                 }
//             }, false);
//         }
//     }
// }

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

    public get content() {
        return this.state.content;
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
                            // @ts-ignore
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
        );
    }

    private onTextAreaContentChange = (
        event: FormEvent<HTMLTextAreaElement>,
    ) => {
        this.setState({
            content: event.currentTarget.value,
        });
    };

    private onPaste = (e: ClipboardEvent) => {
        console.log('on paste', e);
        let image = e.clipboardData?.getData("image/png")
        // e.clipboardData.
        console.log(e.clipboardData?.items);
        for (let k in e.clipboardData?.items) {
            // @ts-ignore
            let item = e.clipboardData?.items[k]
            if (item.type === 'image/png') {
                let image = item.getAsFile();
                console.log(image);
                const reader = new FileReader();
                reader.readAsDataURL(image);
                reader.addEventListener("load", () => {
                    // convert image file to base64 string
                    if (reader.result) {
                        // @ts-ignore
                        console.log("read as data url done", e.target.textContent, reader.result);
                        // @ts-ignore
                        // e.currentTarget.value += reader.result
                        this.setState({
                            content: this.state.content+`<image src="${reader.result}">`
                        });
                    }
                }, false);
            }
        }

        // let items = e.clipboardData
        // for (let item of items) {
        //     console.log(item.types);
        //     let image = await item.getType("image/png");
        //     // console.log()
        //     // image.
        //     // let t = await image.text()
        //     const reader = new FileReader();
        //     reader.readAsDataURL(image);
        //     reader.addEventListener("load", function () {
        //         // convert image file to base64 string
        //         if (reader.result) {
        //             navigator.clipboard.writeText(String(reader.result))
        //         }
        //     }, false);
        // }
    }

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
