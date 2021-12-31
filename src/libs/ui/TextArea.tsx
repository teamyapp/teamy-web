import React, { Component, FormEvent, createRef } from 'react';

import styles from './TextArea.module.scss';

interface IProps {
    label?: string;
    content?: string;
    placeholder?: string;
    autoFocus?: boolean;
    onChange?: (content: string) => void;
    onBlur?: () => void;
}

interface IState {
    content: string;
}

export class TextAreaUI extends Component<IProps, IState> {
    private readonly textAreaRef = createRef<HTMLTextAreaElement>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            content: props.content || '',
        };
    }

    public get content() {
        return this.state.content;
    }

    public set content(value: string) {
        this.setState({
            content: value,
        });
    }

    public render() {
        return (
            <div className={`${styles.TextArea}`}>
                {this.props.label && (
                    <div className={styles.Label}>{this.props.label}</div>
                )}
                <textarea
                    ref={this.textAreaRef}
                    className={styles.Input}
                    value={this.state.content}
                    placeholder={this.props.placeholder}
                    autoFocus={this.props.autoFocus || false}
                    onChange={this.onTextAreaContentChange}
                    onBlur={this.props.onBlur}
                />
            </div>
        );
    }

    public componentDidMount() {
        const el = this.textAreaRef.current;
        if (this.props.autoFocus && el) {
            const end = el.value.length;
            el.setSelectionRange(end, end);
        }
    }

    private onTextAreaContentChange = (
        event: FormEvent<HTMLTextAreaElement>,
    ) => {
        const content = event.currentTarget.value;
        this.setState({
            content: content,
        });
        this.props.onChange?.call(null, content);
    };
}
