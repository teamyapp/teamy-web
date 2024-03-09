import moment from 'moment';
import {ReactElement, ReactNode, RefObject, useEffect, useState} from 'react';
import styles from './Timeline.component.module.scss';

const dayOfWeekLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthOfYearLabel = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const dayWidth = 50;

interface Year {
    yearOf: number;
    totalDays: number;
}

interface Month {
    monthOfYear: number;
    totalDays: number;
}

interface Day {
    dayOfMonth: number;
    dayOfWeek: number;
}

interface Item {
    ref: RefObject<any>,
    view: ReactElement;
    startAt: Date;
    endAt: Date;
}

export interface Row {
    height: number;
    items: Item[];
}

interface Props {
    startAt: Date;
    endAt: Date;
    rows: Row[];
}

export function TimelineComponent(props: Props) {
    let [years, setYears] = useState<Year[]>([]);
    let [months, setMonths] = useState<Month[]>([]);
    let [days, setDays] = useState<Day[]>([]);
    let [currTime, setCurrTime] = useState<Date>(new Date());

    useEffect(() => {
        const startMoment = moment(props.startAt);
        let endMoment = moment(props.endAt);
        let shouldAddOneDay = endMoment.hours() > 0 ||
            endMoment.minutes() > 0 ||
            endMoment.seconds() > 0 ||
            endMoment.milliseconds() > 0;
        endMoment = endMoment.startOf('day');
        if (shouldAddOneDay) {
            endMoment.add(1, 'day');
        }

        let totalDays = endMoment.diff(startMoment, 'days');
        let totalMonths = endMoment.diff(startMoment, 'months');
        let totalYears = endMoment.diff(startMoment, 'years');

        let tmpDays: Day[] = [];
        for (let index = 0; index < totalDays; index++) {
            let dayMoment = startMoment.clone().add(index, 'day');
            tmpDays.push({
                dayOfMonth: dayMoment.date(),
                dayOfWeek: dayMoment.isoWeekday()
            });
        }

        let tmpMonths: Month[] = [];
        let remainingDaysAfterMonths = totalDays;
        for (let index = 0; index < totalMonths; index++) {
            let monthMoment = startMoment.clone().add(index, 'month');
            let daysInMonth = monthMoment.daysInMonth();
            tmpMonths.push({
                monthOfYear: monthMoment.month(),
                totalDays: daysInMonth
            });
            remainingDaysAfterMonths -= daysInMonth;
        }

        if (remainingDaysAfterMonths > 0) {
            tmpMonths.push({
                monthOfYear: endMoment.month(),
                totalDays: remainingDaysAfterMonths
            });
        }

        let tmpYears: Year[] = [];
        let remainingDaysAfterYears = totalDays;
        for (let index = 0; index < totalYears; index++) {
            let yearMoment = startMoment.clone().add(index, 'year');
            let daysInYear = yearMoment.isLeapYear() ? 366 : 365;
            tmpYears.push({
                yearOf: yearMoment.year(),
                totalDays: daysInYear
            });
            remainingDaysAfterYears -= daysInYear;
        }

        if (remainingDaysAfterYears > 0) {
            tmpYears.push({
                yearOf: endMoment.year(),
                totalDays: remainingDaysAfterYears
            });
        }

        setYears(tmpYears);
        setMonths(tmpMonths);
        setDays(tmpDays);

        const interval = setInterval(() => {
            setCurrTime(new Date());
        }, 1800_000);
        return () => clearInterval(interval);
    }, []);

    const renderItem = (item: Item, index: number) => {
        const startOffset = moment(item.startAt).diff(moment(props.startAt), 'days');
        const left = dayWidth * startOffset;
        const duration = moment.duration(moment(item.endAt).diff(moment(item.startAt)));
        const width = dayWidth * duration.asDays();
        return (
            <div key={index} className={styles.Item} style={{
                left: left,
                width: width
            }}>
                {item.view}
            </div>
        );
    };

    const renderRow = (row: Row, index: number) => {
        return (
            <div key={index}
                 className={styles.Row}
                 style={{
                     height: row.height
                 }}>
                {row.items.map(renderItem)}
            </div>
        );
    };

    const currentTimeDiff = moment.duration(moment(currTime).diff(moment(props.startAt)));
    const currentTimeLeftOffset = dayWidth * currentTimeDiff.asDays();
    return (
        <div className={styles.Timeline}>
            <div className={styles.Scrollable}>
                <div className={styles.Labels}>
                    <div className={styles.Years}>
                        {
                            years.map((year, index) => {
                                return (
                                    <div key={index} className={styles.Year}
                                         style={{
                                             width: dayWidth * year.totalDays
                                         }}>
                                        <div className={styles.YearLabel}>{year.yearOf}</div>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className={styles.Months}>
                        {
                            months.map((month, index) => {
                                return (
                                    <div key={index} className={styles.Month}
                                         style={{
                                             width: dayWidth * month.totalDays
                                         }}>
                                        <div
                                            className={styles.MonthOfYearLabel}>{monthOfYearLabel[month.monthOfYear]}</div>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className={styles.Days}>
                        {
                            days.map((day, index) => {
                                return (
                                    <div key={index} className={styles.Day} style={{
                                        width: dayWidth
                                    }}>
                                        <div className={styles.DayOfWeekLabel}>
                                            {dayOfWeekLabel[day.dayOfWeek - 1]}
                                        </div>
                                        <div className={styles.DayOfMonthLabel}>
                                            {day.dayOfMonth}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className={styles.Lines}>
                        {
                            days.map((day, index) => {
                                return (
                                    <div key={index} className={styles.DayLine} style={{
                                        width: dayWidth
                                    }}/>
                                );
                            })
                        }
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.Lines}>
                        {
                            days.map((day, index) => {
                                return (
                                    <div key={index} className={styles.DayLine} style={{
                                        width: dayWidth
                                    }}/>
                                );
                            })
                        }
                    </div>
                    <div className={styles.Rows}>
                        {
                            props.rows.map(renderRow)
                        }
                    </div>
                </div>
                <div className={styles.CurrentTime}
                     style={{
                         left: currentTimeLeftOffset
                     }}>
                    <div className={styles.Marker}/>
                    <div className={styles.Line}/>
                </div>
            </div>
        </div>
    );
}