import classNames from 'classnames';
import moment from 'moment';
import React, { Component, ReactNode, createRef, MouseEvent } from 'react';

import { RelativeLayout } from '@lib/layout/relativeLayout';

import styles from './DateLabelPicker.module.scss';
import { DatePickerContainerUI } from './DatePickerContainer';
import { MaterialIconUI } from './MaterialIcon';
import { TextFieldUI } from './TextField';

const dateFormat = 'MM/DD/YYYY';
const DATE_PICKER_Z_INDEX = 101;

// this component is similar to dropdown list, you need to add transformSelectedOptionContainer

interface Props {
    value?: Date;
    shownValue?: string;
    isWarn?: boolean;
    minYear?: number;
    maxYear?: number;
    onChange?: (date?: Date) => void;
    relativeLayout: RelativeLayout;
    transformReferenceContainer?: (props: {
        showFollower: boolean;
        container: ReactNode;
    }) => ReactNode;
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
                relativeLayout={this.props.relativeLayout}
                onTargetChanged={this.props.onChange}
                zOffset={DATE_PICKER_Z_INDEX}
                value={this.props.value}
                minYear={this.props.minYear}
                maxYear={this.props.maxYear}
                renderReferenceElement={({ onToggle }) => (
                    <div
                        onClick={this.onToggleHandler(onToggle)}
                        className={`${styles.DateLabelPicker} ${classNames({
                            [styles.Warn]: this.props.isWarn,
                        })}`}
                    >
                        <MaterialIconUI>alarm</MaterialIconUI>
                        {this.props.shownValue && (
                            <div className={styles.Time}>
                                {this.props.shownValue}
                            </div>
                        )}
                    </div>
                )}
                transformReferenceContainer={this.props.transformReferenceContainer}
            />
        );
    }

    private onToggleHandler = (onToggle: () => void) => {
        return (event: MouseEvent) => {
            event.stopPropagation();
            onToggle();
        };
    };
}
