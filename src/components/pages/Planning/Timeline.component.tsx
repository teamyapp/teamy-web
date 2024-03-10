import {fail} from 'assert';
import classNames from 'classnames';
import moment from 'moment';
import {
    ForwardedRef,
    ReactElement,
    RefObject,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import styles from './Timeline.component.module.scss';

const dayOfWeekLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const monthOfYearLabel = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

const yearLabelWidth = 50;
const monthLabelWidth = 50;
const dayLabelWidth = 50;
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
    onItemSelect?: (rowIndex: number, itemIndex: number) => void;
}

export interface TimelineComponentHandle {
    showAndSelectItem: (rowIndex: number, itemIndex: number) => void;
}

interface SelectedItem {
    rowIndex: number;
    itemIndex: number;
}

export const TimelineComponent = forwardRef(
    (props: Props, ref: ForwardedRef<TimelineComponentHandle>) => {
        let [years, setYears] = useState<Year[]>([]);
        let [months, setMonths] = useState<Month[]>([]);
        let [days, setDays] = useState<Day[]>([]);
        let [currTime, setCurrTime] = useState<Date>(new Date());
        let [selectedItem, setSelectedItem] = useState<SelectedItem>();

        const refs: RefObject<any>[][] = props.rows.map((row) =>
            row.items.map((item) => useRef()),
        );

        const onItemClickHandler = (rowIndex: number, itemIndex: number) => {
            return () => {
                refs[rowIndex][itemIndex].current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });
                setSelectedItem({
                    rowIndex,
                    itemIndex,
                });
                props.onItemSelect?.(rowIndex, itemIndex);
            };
        };

        useImperativeHandle(ref, () => ({
            showAndSelectItem: (rowIndex: number, itemIndex: number) => {
                refs[rowIndex][itemIndex].current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });
                setSelectedItem({
                    rowIndex,
                    itemIndex,
                });
            },
        }));

        useEffect(() => {
            const startMoment = moment(props.startAt);
            let endMoment = moment(props.endAt);
            let shouldAddOneDay =
                endMoment.hours() > 0 ||
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
                    dayOfWeek: dayMoment.isoWeekday(),
                });
            }

            let tmpMonths: Month[] = [];
            let remainingDaysAfterMonths = totalDays;
            for (let index = 0; index < totalMonths; index++) {
                let monthMoment = startMoment.clone().add(index, 'month');
                let daysInMonth = monthMoment.daysInMonth();
                tmpMonths.push({
                    monthOfYear: monthMoment.month(),
                    totalDays: daysInMonth,
                });
                remainingDaysAfterMonths -= daysInMonth;
            }

            if (remainingDaysAfterMonths > 0) {
                tmpMonths.push({
                    monthOfYear: endMoment.month(),
                    totalDays: remainingDaysAfterMonths,
                });
            }

            let tmpYears: Year[] = [];
            let remainingDaysAfterYears = totalDays;
            for (let index = 0; index < totalYears; index++) {
                let yearMoment = startMoment.clone().add(index, 'year');
                let daysInYear = yearMoment.isLeapYear() ? 366 : 365;
                tmpYears.push({
                    yearOf: yearMoment.year(),
                    totalDays: daysInYear,
                });
                remainingDaysAfterYears -= daysInYear;
            }

            if (remainingDaysAfterYears > 0) {
                tmpYears.push({
                    yearOf: endMoment.year(),
                    totalDays: remainingDaysAfterYears,
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

        const renderItem = (rowIndex: number) => {
            return (item: Item, index: number) => {
                const startOffset = moment(item.startAt).diff(
                    moment(props.startAt),
                    'days',
                );
                const left = dayWidth * startOffset;
                const duration = moment.duration(
                    moment(item.endAt).diff(moment(item.startAt)),
                );
                const width = dayWidth * duration.asDays();
                const selected =
                    selectedItem?.rowIndex === rowIndex &&
                    selectedItem?.itemIndex === index;
                return (
                    <div
                        key={index}
                        ref={refs[rowIndex][index]}
                        className={`${styles.Item} ${classNames({
                            [styles.Selected]: selected,
                        })}`}
                        style={{
                            left: left,
                            width: width,
                        }}
                        onClick={onItemClickHandler(rowIndex, index)}
                    >
                        {item.view}
                    </div>
                );
            };
        };

        const renderRow = (row: Row, index: number) => {
            return (
                <div
                    key={index}
                    className={styles.Row}
                    style={{
                        height: row.height,
                    }}
                >
                    {row.items.map(renderItem(index))}
                </div>
            );
        };

        const currentTimeDiff = moment.duration(
            moment(currTime).diff(moment(props.startAt)),
        );
        const currentTimeLeftOffset = dayWidth * currentTimeDiff.asDays();
        return (
            <div className={styles.Timeline}>
                <div className={`${styles.Scrollable} ${classNames({
                    [styles.Debug]: false,
                })}`}>
                    <div className={styles.Labels}>
                        <div className={styles.Years}>
                            {years.map((year, index) => {
                                return (
                                    <>
                                        <div
                                            key={index}
                                            className={styles.YearLabel}
                                            style={{
                                                width: yearLabelWidth,
                                            }}>
                                            {year.yearOf}
                                        </div>
                                        <div
                                            key={index}
                                            className={styles.YearSpacer}
                                            style={{
                                                width: dayWidth * year.totalDays - yearLabelWidth,
                                            }}
                                        />
                                    </>
                                );
                            })}
                        </div>
                        <div className={styles.Months}>
                            {months.map((month, index) => {
                                return (
                                    <>
                                        <div
                                            key={index}
                                            className={styles.MonthOfYearLabel}
                                            style={{
                                                width: monthLabelWidth,
                                            }}
                                        >
                                            {
                                                monthOfYearLabel[
                                                    month.monthOfYear
                                                    ]
                                            }
                                        </div>
                                        <div
                                            key={index}
                                            className={styles.MonthSpacer}
                                            style={{
                                                width: dayWidth * month.totalDays - monthLabelWidth,
                                            }}
                                        />
                                    </>
                                );
                            })}
                        </div>
                        <div className={styles.Days}>
                            {days.map((day, index) => {
                                return (
                                    <>
                                        <div
                                            key={index}
                                            className={styles.DayLabel}
                                            style={{
                                                width: dayWidth,
                                            }}
                                        >
                                            <div className={styles.DayOfWeekLabel}>
                                                {dayOfWeekLabel[day.dayOfWeek - 1]}
                                            </div>
                                            <div className={styles.DayOfMonthLabel}>
                                                {day.dayOfMonth}
                                            </div>
                                        </div>
                                    </>
                                );
                            })}
                        </div>
                        <div className={styles.Lines}>
                            {days.map((day, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={styles.DayLine}
                                        style={{
                                            width: dayWidth,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className={styles.Content}>
                        <div className={styles.Lines}>
                            {days.map((day, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={styles.DayLine}
                                        style={{
                                            width: dayWidth,
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <div className={styles.Rows}>
                            {props.rows.map(renderRow)}
                        </div>
                    </div>
                    <div
                        className={styles.CurrentTime}
                        style={{
                            left: currentTimeLeftOffset,
                        }}
                    >
                        <div className={styles.Marker}/>
                        <div className={styles.Line}/>
                    </div>
                </div>
            </div>
        );
    },
);
