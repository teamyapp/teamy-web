import moment from 'moment';
import React, { Component, ReactNode, createRef } from 'react';

import { RelativeLayout } from '@lib/layout/relativeLayout';

import { DatePickerContainerUI } from './DatePickerContainer';
import { TextFieldUI } from './TextField';

const dateFormat = 'MM/DD/YYYY';

interface Props {
    label?: string;
    value?: Date;
    minYear?: number;
    maxYear?: number;
    zOffset?: number;
    onChange?: (date?: Date) => void;
    relativeLayout: RelativeLayout;
}

interface State {
    value: string;
}

export class DateTextPickerUI extends Component<Props, State> {
    private textFieldRef = createRef<TextFieldUI>();

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
                zOffset={this.props.zOffset}
                relativeLayout={this.props.relativeLayout}
                onTargetChanged={this.handleTargetChanged}
                onTargetFocus={this.handleTargetFocus}
                value={this.props.value}
                minYear={this.props.minYear}
                maxYear={this.props.maxYear}
                renderReferenceElement={({ onChange, onToggle }) => (
                    <TextFieldUI
                        ref={this.textFieldRef}
                        label={this.props.label}
                        value={this.state.value}
                        placeholder={dateFormat.toLowerCase()}
                        icon={'date_range'}
                        onIconClick={onToggle}
                        onBlur={this.onTextFieldBlur(onChange)}
                    />
                )}
            />
        );
    }

    private handleTargetFocus = () => {
        if (this.textFieldRef) {
            this.textFieldRef.current?.focus();
        }
    };

    private handleTargetChanged = (date: Date) => {
        if (this.textFieldRef.current) {
            this.textFieldRef.current.value = moment(date).format(dateFormat);
        }
    };

    private onTextFieldBlur = (onChange: (date: Date) => void) => {
        return () => {
            const value = this.textFieldRef.current?.value;
            if (!value) {
                this.props.onChange?.call(null, undefined);
                return;
            }

            let momentDate = moment(value, dateFormat, true);
            if (momentDate.isValid()) {
                const date = momentDate.toDate();
                onChange(date);
                this.props.onChange?.call(null, date);
            }
        };
    };
}
