import classNames from 'classnames';
import React, { Component, FormEvent, ReactElement, createRef } from 'react';

import { MaterialIconUI } from './MaterialIcon';
import './TextField.module.scss';
import styles from './TextField.module.scss';

const defaultMaxLength = 524288;

interface IProps {
    value?: string;
    label?: string;
    placeholder?: string;
    showLengthCounter?: boolean;
    maxLength?: number;
    icon?: string;
    onChange?: (newValue: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onIconClick?: () => void;
}

interface IState {
    isFocused: boolean;
    value: string;
}

export class TextFieldUI extends Component<IProps, IState> {
    private readonly textInputRef = createRef<HTMLInputElement>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            isFocused: false,
            value: props.value || '',
        };
    }

    public render(): ReactElement {
        return (
            <div>
                <div
                    className={`${styles.TextField} ${classNames({
                        [styles.Focus]: this.state.isFocused,
                    })}`}
                >
                    <input
                        ref={this.textInputRef}
                        type={'text'}
                        className={styles.Input}
                        autoComplete={'off'}
                        autoCorrect={'off'}
                        spellCheck={false}
                        value={this.state.value}
                        placeholder={this.props.placeholder || ' '}
                        maxLength={this.props.maxLength || defaultMaxLength}
                        onChange={this.onChange}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                    />
                    <label className={styles.Label}>{this.props.label}</label>
                    {this.props.icon && (
                        <div
                            className={styles.Icon}
                            onClick={this.props.onIconClick}
                        >
                            <MaterialIconUI>{this.props.icon}</MaterialIconUI>
                        </div>
                    )}
                </div>
                {this.props.showLengthCounter && (
                    <div className={styles.LengthHint}>
                        {`${this.state.value.length} / ${this.props.maxLength}`}
                    </div>
                )}
            </div>
        );
    }

    public get value(): string {
        return this.state.value;
    }

    public set value(val: string) {
        this.setState({
            value: val,
        });
    }

    public focus() {
        this.textInputRef.current?.focus();
    }

    private onChange = (event: FormEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;
        this.setState({
            value: value,
        });
        this.props.onChange?.call(null, value);
    };

    private onFocus = () => {
        this.setState({
            isFocused: true,
        });
        this.props.onFocus?.call(null);
    };

    private onBlur = () => {
        this.setState({
            isFocused: false,
        });
        this.props.onBlur?.call(null);
    };
}
