import classNames from 'classnames';
import moment from 'moment';
import React, { Component, ReactNode, createRef } from 'react';

import styles from './DateLabelPicker.module.scss';
import { DatePickerContainerUI } from './DatePickerContainer';
import { MaterialIconUI } from './MaterialIcon';
import { TextFieldUI } from './TextField';

const dateFormat = 'MM/DD/YYYY';

interface Props {
    value?: Date;
    shownValue?: string;
    isWarn?: boolean;
    minYear?: number;
    maxYear?: number;
    onChange?: (date?: Date) => void;
}

interface State {
    value: string;
}

export class DateLabelPickerUI extends Component<Props, State> {
    private readonly textFieldRef = createRef<TextFieldUI>();

    constructor(props: Props) {
        super(props);
        this.state = {
            value: this.props.value
                ? moment(this.props.value).format(dateFormat)
                : '',
        };
    }

    public get value(): Date | null {
        const value = this.textFieldRef.current?.value;
        return value ? new Date(value) : null;
    }

    public focus() {
        this.textFieldRef.current?.focus();
    }

    render(): ReactNode {
        return (
            <DatePickerContainerUI
                onTargetChanged={this.props.onChange}
                value={this.props.value}
                minYear={this.props.minYear}
                maxYear={this.props.maxYear}
                target={({ onToggle }) => (
                    <div
                        onClick={onToggle}
                        className={`${styles.DateLabelPicker} ${classNames({
                            [styles.Warn]: this.props.isWarn,
                        })}`}
                    >
                        <MaterialIconUI>alarm</MaterialIconUI>
                        <div className={styles.Time}>
                            {this.props.shownValue}
                        </div>
                    </div>
                )}
            />
        );
    }
}
