import classNames from 'classnames';
import React, { Component, FormEvent, ReactElement } from 'react';
import MaterialIconComponent from './MaterialIcon.component';
import './TextField.component.module.scss';
import styles from './TextField.component.module.scss';

const defaultMaxLength = 524288;

interface OnChangeHandler {
    (newValue: string): void;
}

interface OnFocusHandler {
    (): void;
}

interface OnBlurHandler {
    (): void;
}

interface OnIconClickHandler {
    (): void;
}

interface IProps {
    value?: string;
    label?: string;
    placeholder?: string;
    showLengthCounter?: boolean;
    maxLength?: number;
    icon?: string;
    onChange?: OnChangeHandler;
    onFocus?: OnFocusHandler;
    onBlur?: OnBlurHandler;
    onIconClick?: OnIconClickHandler;
}

interface IState {
    isFocused: boolean;
}

export default class TextFieldComponent extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isFocused: false,
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
                        type={'text'}
                        className={styles.Input}
                        autoComplete={'off'}
                        autoCorrect={'off'}
                        spellCheck={false}
                        value={this.props.value}
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
                            <MaterialIconComponent>
                                {this.props.icon}
                            </MaterialIconComponent>
                        </div>
                    )}
                </div>
                {this.props.showLengthCounter && (
                    <div className={styles.LengthHint}>
                        {`${this.props.value?.length} / ${this.props.maxLength}`}
                    </div>
                )}
            </div>
        );
    }

    private onChange = (event: FormEvent<HTMLInputElement>) => {
        this.props.onChange?.call(this, event.currentTarget.value);
    };

    private onFocus = () => {
        this.setState({
            isFocused: true,
        });

        this.props.onFocus?.call(this);
    };

    private onBlur = () => {
        this.setState({
            isFocused: false,
        });

        this.props.onBlur?.call(this);
    };
}
