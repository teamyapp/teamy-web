import moment from 'moment';
import React, { Component, ReactNode } from 'react';

import { RelativeLayout, RelativeLayoutContainerUI } from '@lib/layout';

import { today } from '../data/format';
import { CalendarUI } from './Calendar';

const dateFormat = 'MM/DD/YYYY';

interface Props {
    target: ({
        onChange,
        onToggle,
    }: {
        onChange: (date: Date) => void;
        onToggle: () => void;
    }) => ReactNode;
    onTargetChanged?: (date: Date) => void;
    onTargetFocus?: () => void;
    value?: Date;
    minYear?: number;
    maxYear?: number;
    zOffset?: number;
    relativeLayout: RelativeLayout;
}

interface State {
    value: string;
    selectedDate: Date;
    shownDate: Date;
}

export class DatePickerContainerUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const date = this.props.value || today();
        this.state = {
            value: this.props.value
                ? moment(this.props.value).format(dateFormat)
                : '',
            selectedDate: date,
            shownDate: date,
        };
    }

    render(): ReactNode {
        return (
            <RelativeLayoutContainerUI
                zOffset={this.props.zOffset}
                relativeLayout={this.props.relativeLayout}
                overSpaceAction="jumpVertically"
                renderReferenceElement={({ onToggle }) =>
                    this.props.target({
                        onToggle,
                        onChange: this.handleCalendarChanged,
                    })
                }
                renderFollower={({ onClose }) => (
                    <CalendarUI
                        onClose={this.handleCalendarClosed(onClose)}
                        onChange={this.handleCalendarChanged}
                        onShownDateChange={this.handleShownDateChanged}
                        selectedDate={this.state.selectedDate}
                        shownDate={this.state.shownDate}
                    />
                )}
            />
        );
    }

    private handleShownDateChanged = (date: Date) => {
        this.setState({ shownDate: date });
    };

    private handleCalendarChanged = (date: Date) => {
        this.setState({
            selectedDate: date,
            shownDate: date,
        });

        this.props.onTargetChanged?.call(null, date);
    };

    private handleCalendarClosed = (onClose: () => void) => {
        return () => {
            onClose();
            this.props.onTargetFocus?.call(null);
        };
    };
}
