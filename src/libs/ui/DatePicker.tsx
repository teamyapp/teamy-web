import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import React, { Component, ReactElement, createRef } from 'react';

import styles from './DatePicker.module.scss';
import { MaterialIconUI } from './MaterialIcon';
import { TextFieldUI } from './TextField';

const weekDayTitles = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const defaultMinYear = 1970;
const defaultMaxYear = 2100;

const dateFormat = 'MM/DD/YYYY';

const today = new Date();

interface IProps {
    label?: string;
    minYear?: number;
    maxYear?: number;
}

interface IState {
    showCalendar: boolean;
    showSelectYear: boolean;
    selectedDate: Date;
    shownDate: Date;
}

export class DatePickerUI extends Component<IProps, IState> {
    private textFieldRef = createRef<TextFieldUI>();
    private calendarRef = createRef<HTMLDivElement>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            showCalendar: false,
            showSelectYear: false,
            selectedDate: today,
            shownDate: today,
        };
    }

    public get value(): Date | null {
        const value = this.textFieldRef.current?.value;
        return value ? new Date(value) : null;
    }

    private static getMonthDays(date: Date): (null | number)[] {
        const year = date.getFullYear();
        const month = date.getMonth();

        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        const startWeekDay = monthStart.getDay();

        const days: (null | number)[] = [];
        for (let i = 0; i < startWeekDay; i++) {
            days.push(null);
        }

        const startDay = monthStart.getDate();
        const endDay = monthEnd.getDate();
        return days.concat(_.range(startDay, endDay + 1));
    }

    render(): ReactElement {
        return (
            <div className={styles.DatePicker}>
                <TextFieldUI
                    ref={this.textFieldRef}
                    label={this.props.label}
                    placeholder={dateFormat.toLowerCase()}
                    icon={'date_range'}
                    onIconClick={this.onCalendarIconClick}
                    onBlur={this.onTextFieldBlur}
                />
                {this.state.showCalendar && (
                    <div
                        ref={this.calendarRef}
                        tabIndex={-1}
                        className={styles.Calendar}
                        onBlur={this.onCalendarBlur}
                    >
                        {this.renderCalendarControls()}
                        {this.state.showSelectYear
                            ? this.renderSelectYear()
                            : this.renderSelectMonthDay()}
                    </div>
                )}
            </div>
        );
    }

    private renderCalendarControls(): ReactElement {
        const year = this.state.shownDate.getFullYear();
        const month = this.state.shownDate.getMonth();

        return (
            <div className={styles.Controls}>
                <div>
                    {monthNames[month]} {year}
                </div>
                <div
                    className={`${styles.Button} ${styles.ShowYears}`}
                    onClick={this.onToggleSelectYear}
                >
                    <MaterialIconUI>
                        {this.state.showSelectYear
                            ? 'arrow_drop_down'
                            : 'arrow_drop_up'}
                    </MaterialIconUI>
                </div>
                <div className={styles.Spacer} />
                <div
                    className={`${styles.Button}`}
                    onClick={this.onPrevMonthClick}
                >
                    <MaterialIconUI>navigate_before</MaterialIconUI>
                </div>
                <div
                    className={`${styles.Button}`}
                    onClick={this.onNextMonthClick}
                >
                    <MaterialIconUI>navigate_next</MaterialIconUI>
                </div>
            </div>
        );
    }

    private renderSelectYear(): ReactElement {
        const years = _.range(
            this.props.minYear || defaultMinYear,
            (this.props.maxYear || defaultMaxYear) + 1,
        );
        return (
            <div className={styles.SelectYear}>
                {years.map(this.renderYear)}
            </div>
        );
    }

    private renderYear = (year: number, index: number): ReactElement => {
        return (
            <div
                key={index}
                className={`${styles.Year} ${classNames({
                    [styles.Selected]: this.showingSelectedYear(year),
                })}`}
                onClick={this.onYearClickHandler(year)}
            >
                {year}
            </div>
        );
    };

    private renderSelectMonthDay(): ReactElement {
        return (
            <div className={styles.Month}>
                {weekDayTitles.map(this.renderWeekDay)}
                {this.renderMonthDays()}
            </div>
        );
    }

    private renderMonthDays(): ReactElement[] {
        return DatePickerUI.getMonthDays(this.state.shownDate).map(
            this.renderMonthDay,
        );
    }

    private renderMonthDay = (
        monthDay: null | number,
        index: number,
    ): ReactElement => {
        return monthDay ? (
            <div
                key={index}
                className={`${styles.Cell} ${styles.Day} ${classNames({
                    [styles.Selected]: this.showingSelectedDate(monthDay),
                    [styles.Today]: this.showingToday(monthDay),
                })}`}
                onClick={this.onDayClickHandler(monthDay)}
            >
                {monthDay}
            </div>
        ) : (
            <div key={index} className={`${styles.Cell}`} />
        );
    };

    private onTextFieldBlur = () => {
        let momentDate = moment(
            this.textFieldRef.current?.value || new Date(),
            dateFormat,
            true,
        );
        if (momentDate.isValid()) {
            const date = momentDate.toDate();
            this.setState({
                selectedDate: date,
                shownDate: date,
            });
        }
    };

    private onToggleSelectYear = () => {
        this.setState({
            showSelectYear: !this.state.showSelectYear,
        });
    };

    private onDayClickHandler = (monthDay: number): (() => void) => {
        return () => {
            const newDate = new Date(this.state.shownDate);
            newDate.setDate(monthDay);
            if (this.textFieldRef.current) {
                this.textFieldRef.current.value =
                    moment(newDate).format(dateFormat);
            }
            this.setState({
                selectedDate: newDate,
                shownDate: newDate,
                showCalendar: false,
            });
        };
    };

    private onYearClickHandler = (year: number): (() => void) => {
        return () => {
            const newDate = new Date(this.state.shownDate);
            newDate.setFullYear(year);

            this.setState({
                shownDate: newDate,
            });
        };
    };

    private showingSelectedDate(shownMonthDay: number): boolean {
        return this.showingGivenDate(this.state.selectedDate, shownMonthDay);
    }

    private showingSelectedYear(year: number): boolean {
        return this.state.selectedDate.getFullYear() === year;
    }

    private showingToday(shownMonthDay: number): boolean {
        return this.showingGivenDate(today, shownMonthDay);
    }

    private showingGivenDate(givenDate: Date, shownMonthDay: number): boolean {
        const shownDate = this.state.shownDate;
        return (
            shownDate.getFullYear() === givenDate.getFullYear() &&
            shownDate.getMonth() === givenDate.getMonth() &&
            shownMonthDay === givenDate.getDate()
        );
    }

    private renderWeekDay = (
        weekDayTitle: string,
        index: number,
    ): ReactElement => {
        return (
            <div
                key={index}
                className={`${styles.Cell} ${styles.WeekDayTitle}`}
            >
                {weekDayTitle}
            </div>
        );
    };

    private onCalendarIconClick = () => {
        const showCalendar = !this.state.showCalendar;
        this.setState({
            showCalendar: showCalendar,
        });

        if (showCalendar) {
            setTimeout(() => {
                this.calendarRef.current?.focus();
            });
        }
    };

    private onCalendarBlur = () => {
        this.setState({
            showCalendar: false,
        });
    };

    private onPrevMonthClick = () => {
        this.updateMonth((currMonth: number) => currMonth - 1);
    };

    private onNextMonthClick = () => {
        this.updateMonth((currMonth: number) => currMonth + 1);
    };

    private updateMonth = (nextMonth: (currMonth: number) => number) => {
        const newDate = new Date(this.state.shownDate);
        newDate.setMonth(nextMonth(newDate.getMonth()));
        this.setState({
            shownDate: newDate,
        });
    };
}
