import React, { Component, FormEvent } from 'react';
import styles from './TextArea.module.scss';

interface IProps {
    label?: string;
    content?: string;
    placeholder?: string;
    onChange?: (content: string) => void;
    onBlur?: () => void;
}

interface IState {
    content: string;
}

export class TextAreaUI extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            content: props.content || '',
        };
    }

    public render() {
        return (
            <div className={`${styles.TextArea}`}>
                {this.props.label && (
                    <div className={styles.Label}>{this.props.label}</div>
                )}
                <textarea
                    className={styles.Input}
                    value={this.state.content}
                    placeholder={this.props.placeholder}
                    onChange={this.onTextAreaContentChange}
                    onBlur={this.props.onBlur}
                />
            </div>
        );
    }

    public get content() {
        return this.state.content;
    }

    public set content(value: string) {
        this.setState({
            content: value,
        });
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
