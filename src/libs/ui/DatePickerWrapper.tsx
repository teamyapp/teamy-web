import { today } from '../../components/internal/format';
import moment from 'moment';
import React, { Component, ReactNode } from 'react';

import { CalendarUI } from './Calendar';

const dateFormat = 'MM/DD/YYYY';

interface Props {
    target: ({onChange, onToggle}: {onChange: (date: Date) => void, onToggle: () => void }) => ReactNode;
    onTargetChanged?: (date: Date) => void;
    onTargetFocus?: () => void;
    value?: Date;
    minYear?: number;
    maxYear?: number;
}

interface State {
    value: string;
    showCalendar: boolean;
    selectedDate: Date;
    shownDate: Date;
}

export class DatePickerWrapperUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const date = this.props.value || today();
        this.state = {
            value: this.props.value
                ? moment(this.props.value).format(dateFormat)
                : '',
            showCalendar: false,
            selectedDate: date,
            shownDate: date,
        };
    }

    render(): ReactNode {
        return (
            <div>
                {this.props.target({onChange: this.handleCalendarChanged, onToggle: this.onToggle})}
                {this.state.showCalendar && (
                    <CalendarUI
                        onClose={this.handleCalendarClosed}
                        onChange={this.handleCalendarChanged}
                        onShownDateChange={this.handleShownDateChanged}
                        selectedDate={this.state.selectedDate}
                        shownDate={this.state.shownDate}
                    />
                )}
            </div>
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

        this.props.onTargetChanged?.call(null, date)
    };

    private handleCalendarClosed = () => {
        this.setState({
            showCalendar: false,
        });


        this.props.onTargetFocus?.call(null)
    };

    private onToggle = () => {
        const showCalendar = !this.state.showCalendar;
        this.setState({
            showCalendar: showCalendar,
        });
    };
}
