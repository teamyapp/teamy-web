import classNames from 'classnames';
import _ from 'lodash';
import React, { Component, ReactNode, createRef } from 'react';

import { today } from '../data/format';
import styles from './Calendar.module.scss';
import { MaterialIconUI } from './MaterialIcon';

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

interface Props {
    selectedDate: Date;
    shownDate: Date;
    minYear?: number;
    maxYear?: number;
    onClose?: () => void;
    onChange?: (date: Date) => void;
    onShownDateChange?: (shownDate: Date) => void;
}

interface State {
    showSelectYear: boolean;
}

export class CalendarUI extends Component<Props, State> {
    private calendarRef = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);

        this.state = {
            showSelectYear: false,
        };
    }

    public render(): ReactNode {
        return (
            <div
                ref={this.calendarRef}
                tabIndex={-1}
                className={styles.Calendar}
                onBlur={this.props.onClose}
            >
                {this.renderCalendarControls()}
                {this.state.showSelectYear
                    ? this.renderSelectYear()
                    : this.renderSelectMonthDay()}
            </div>
        );
    }

    private renderSelectYear(): ReactNode {
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

    private renderCalendarControls(): ReactNode {
        const year = this.props.shownDate.getFullYear();
        const month = this.props.shownDate.getMonth();

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
                <div className={styles.Button} onClick={this.onPrevMonthClick}>
                    <MaterialIconUI>navigate_before</MaterialIconUI>
                </div>
                <div className={styles.Button} onClick={this.onNextMonthClick}>
                    <MaterialIconUI>navigate_next</MaterialIconUI>
                </div>
            </div>
        );
    }

    private renderYear = (year: number, index: number): ReactNode => {
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

    private renderSelectMonthDay(): ReactNode {
        return (
            <div className={styles.Month}>
                {weekDayTitles.map(this.renderWeekDay)}
                {this.renderMonthDays()}
            </div>
        );
    }

    private renderMonthDays(): ReactNode[] {
        return getMonthDays(this.props.shownDate).map(this.renderMonthDay);
    }

    private renderMonthDay = (
        monthDay: null | number,
        index: number,
    ): ReactNode => {
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

    private onToggleSelectYear = () => {
        this.setState({
            showSelectYear: !this.state.showSelectYear,
        });
    };

    private onDayClickHandler = (monthDay: number): (() => void) => {
        return () => {
            const newDate = new Date(this.props.shownDate);
            newDate.setDate(monthDay);
            this.props.onClose?.call(null);
            this.props.onChange?.call(null, newDate);
        };
    };

    private onYearClickHandler = (year: number): (() => void) => {
        return () => {
            const newDate = new Date(this.props.shownDate);
            newDate.setFullYear(year);
            this.props.onChange?.call(null, newDate);
        };
    };

    private showingSelectedDate(shownMonthDay: number): boolean {
        return this.showingGivenDate(this.props.selectedDate, shownMonthDay);
    }

    private showingSelectedYear(year: number): boolean {
        return this.props.selectedDate.getFullYear() === year;
    }

    private showingToday(shownMonthDay: number): boolean {
        return this.showingGivenDate(today(), shownMonthDay);
    }

    private showingGivenDate(givenDate: Date, shownMonthDay: number): boolean {
        const shownDate = this.props.shownDate;
        return (
            shownDate.getFullYear() === givenDate.getFullYear() &&
            shownDate.getMonth() === givenDate.getMonth() &&
            shownMonthDay === givenDate.getDate()
        );
    }

    private renderWeekDay = (
        weekDayTitle: string,
        index: number,
    ): ReactNode => {
        return (
            <div
                key={index}
                className={`${styles.Cell} ${styles.WeekDayTitle}`}
            >
                {weekDayTitle}
            </div>
        );
    };

    private onPrevMonthClick = () => {
        this.updateMonth((currMonth: number) => currMonth - 1);
    };

    private onNextMonthClick = () => {
        this.updateMonth((currMonth: number) => currMonth + 1);
    };

    private updateMonth = (nextMonth: (currMonth: number) => number) => {
        const newDate = new Date(this.props.shownDate);
        newDate.setDate(1);
        newDate.setMonth(nextMonth(newDate.getMonth()));
        this.props.onShownDateChange?.call(null, newDate);
    };
}

function getMonthDays(date: Date): (null | number)[] {
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
