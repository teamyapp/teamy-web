import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import {Component, ReactElement} from 'react';

import styles from './DatePicker.component.module.scss';
import MaterialIconComponent from './MaterialIcon.component';
import DateService from './services/Date.service';
import TextFieldComponent from './TextField.component';

const weekDayTitles = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
    textFieldContent: string;
}

export class DatePickerComponent extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            showCalendar: false,
            showSelectYear: false,
            selectedDate: today,
            shownDate: today,
            textFieldContent: ''
        };
    }

    render(): ReactElement {
        return (
            <div className={styles.DatePicker}>
                <TextFieldComponent
                    value={this.state.textFieldContent}
                    label={this.props.label}
                    placeholder={dateFormat.toLowerCase()}
                    icon={'date_range'}
                    onChange={this.onTextFieldContentChange}
                    onIconClick={this.onCalendarIconClick}
                    onBlur={this.onTextFieldBlur}/>
                {
                    this.state.showCalendar && (
                        <div className={styles.Calendar}>
                            {this.renderCalendarControls()}
                            {
                                this.state.showSelectYear ?
                                    this.renderSelectYear() :
                                    this.renderSelectMonthDay()
                            }
                        </div>
                    )
                }
            </div>
        );
    }

    private renderCalendarControls(): ReactElement {
        const year = this.state.shownDate.getFullYear();
        const month = this.state.shownDate.getMonth();

        return (
            <div className={styles.Controls}>
                <div>{monthNames[month]} {year}</div>
                <div className={`${styles.Button} ${styles.ShowYears}`}
                     onClick={this.onToggleSelectYear}>
                    <MaterialIconComponent>{
                        this.state.showSelectYear ? 'arrow_drop_down' : 'arrow_drop_up'}
                    </MaterialIconComponent>
                </div>
                <div className={styles.Spacer}/>
                <div className={`${styles.Button}`} onClick={this.onPrevMonthClick}>
                    <MaterialIconComponent>navigate_before</MaterialIconComponent>
                </div>
                <div className={`${styles.Button}`} onClick={this.onNextMonthClick}>
                    <MaterialIconComponent>navigate_next</MaterialIconComponent>
                </div>
            </div>
        );
    }

    private renderSelectYear(): ReactElement {
        const years = _.range(this.props.minYear || defaultMinYear, (this.props.maxYear || defaultMaxYear) + 1);
        return (
            <div className={styles.SelectYear}>
                {years.map(this.renderYear)}
            </div>
        );
    }

    private renderYear = (year: number, index: number): ReactElement => {
        return (
            <div key={index}
                 className={`${styles.Year} ${classNames({
                     [styles.Selected]: this.showingSelectedYear(year)
                 })}`}
                 onClick={this.onYearClickHandler(year)}>
                {year}
            </div>
        );
    };

    private renderSelectMonthDay(): ReactElement {
        return (
            <div className={styles.Month}>
                {
                    weekDayTitles.map(this.renderWeekDay)
                }
                {
                    this.renderMonthDays()
                }
            </div>
        );
    }

    private renderMonthDays(): ReactElement[] {
        return DateService
            .getMonthDays(this.state.shownDate)
            .map(this.renderMonthDay);
    }

    private renderMonthDay = (monthDay: (null | number), index: number): ReactElement => {
        return monthDay ? (
                <div key={index} className={`${styles.Cell} ${styles.Day} ${classNames({
                    [styles.Selected]: this.showingSelectedDate(monthDay),
                    [styles.Today]: this.showingToday(monthDay)
                })}`}
                     onClick={this.onDayClickHandler(monthDay)}>
                    {monthDay}
                </div>
            ) :
            <div key={index} className={`${styles.Cell}`}/>;
    };

    private onTextFieldContentChange = (newValue: string) => {
        this.setState({
            textFieldContent: newValue
        });
    };

    private onTextFieldBlur = () => {
        let momentDate = moment(this.state.textFieldContent, dateFormat, true);
        if (momentDate.isValid()) {
            const date = momentDate.toDate();
            this.setState({
                selectedDate: date,
                shownDate: date
            });
        }
    };

    private onToggleSelectYear = () => {
        this.setState({
            showSelectYear: !this.state.showSelectYear
        });
    };

    private onDayClickHandler = (monthDay: number): () => void => {
        return () => {
            const newDate = new Date(this.state.shownDate);
            newDate.setDate(monthDay);
            this.setState({
                selectedDate: newDate,
                shownDate: newDate,
                showCalendar: false,
                textFieldContent: moment(newDate).format(dateFormat)
            });
        };
    };

    private onYearClickHandler = (year: number): () => void => {
        return () => {
            const newDate = new Date(this.state.shownDate);
            newDate.setFullYear(year);

            this.setState({
                shownDate: newDate
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
        return shownDate.getFullYear() === givenDate.getFullYear() &&
            shownDate.getMonth() === givenDate.getMonth() &&
            shownMonthDay === givenDate.getDate();
    }

    private renderWeekDay = (weekDayTitle: string, index: number): ReactElement => {
        return (
            <div key={index} className={`${styles.Cell} ${styles.WeekDayTitle}`}>
                {weekDayTitle}
            </div>
        );
    };

    private onCalendarIconClick = () => {
        this.setState({
            showCalendar: !this.state.showCalendar
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
            shownDate: newDate
        });
    };
}