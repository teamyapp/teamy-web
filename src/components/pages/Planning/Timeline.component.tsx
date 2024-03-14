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

import {
    Day,
    Month,
    Week,
    Year,
    getDaysBetween,
    getEndOfDay,
    getMonthsBetween,
    getWeeksBetween,
    getYearsBetween,
} from '@lib/time/date';
import { DropDownList, Option } from '@lib/ui/DropDownList';

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

const yearLabelWidth = 44;
const monthLabelWidth = 34;
const weekLabelWidth = 34;
const dayWidth = 50;
const weekDayWidth = 20;
const monthDayWidth = 10;

interface Item {
    view: ReactElement;
    startAt: Date;
    endAt: Date;
}

export interface Row {
    height: number;
    items: Item[];
}

interface SelectedItem {
    rowIndex: number;
    itemIndex: number;
}

type TimeUnit = 'day' | 'week' | 'month';

const timeUnits: Option[] = [
    { key: 'day', description: 'Day' },
    { key: 'week', description: 'Week' },
    { key: 'month', description: 'Month' },
];

interface Props {
    startAt: Date;
    endAt: Date;
    rows: Row[];
    onItemSelect?: (rowIndex: number, itemIndex: number) => void;
}

export interface TimelineComponentHandle {
    showAndSelectItem: (rowIndex: number, itemIndex: number) => void;
}

export const TimelineComponent = forwardRef(
    (props: Props, ref: ForwardedRef<TimelineComponentHandle>) => {
        let [days, setDays] = useState<Day[]>([]);
        let [weeks, setWeeks] = useState<Week[]>([]);
        let [months, setMonths] = useState<Month[]>([]);
        let [years, setYears] = useState<Year[]>([]);
        let [currTime, setCurrTime] = useState<Date>(new Date());
        let [selectedItem, setSelectedItem] = useState<SelectedItem>();
        let [selectedTimeUnit, setSelectedTimeUnit] = useState<TimeUnit>('day');

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
            const endMoment = getEndOfDay(moment(props.endAt));

            const totalDays = getDaysBetween(startMoment, endMoment);
            const totalWeeks = getWeeksBetween(startMoment, endMoment);
            const totalMonths = getMonthsBetween(startMoment, endMoment);
            const totalYears = getYearsBetween(startMoment, endMoment);

            setDays(totalDays);
            setWeeks(totalWeeks);
            setMonths(totalMonths);
            setYears(totalYears);

            const interval = setInterval(() => {
                setCurrTime(new Date());
            }, 1800_000);
            return () => clearInterval(interval);
        }, []);

        useEffect(() => {
            if (selectedItem) {
                refs[selectedItem.rowIndex][
                    selectedItem.itemIndex
                ].current.scrollIntoView({
                    block: 'center',
                    inline: 'center',
                });
            }
        }, [selectedTimeUnit]);

        const renderItem = (rowIndex: number) => {
            return (item: Item, index: number) => {
                const startOffset = moment(item.startAt).diff(
                    moment(props.startAt),
                    'days',
                );
                const scaledDayWidth = getDayWidth();
                const left = scaledDayWidth * startOffset;
                const duration = moment.duration(
                    moment(item.endAt).diff(moment(item.startAt)),
                );
                const width = scaledDayWidth * duration.asDays();
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

        const renderYearLabels = () => {
            return (
                <div className={styles.Years}>
                    {years.map((year, index) => {
                        return (
                            <>
                                <div
                                    key={`label-${index}`}
                                    className={styles.YearLabel}
                                    style={{
                                        width: Math.min(
                                            getDayWidth() * year.totalDays,
                                            yearLabelWidth,
                                        ),
                                    }}
                                >
                                    {year.yearOf}
                                </div>
                                <div
                                    key={`spacer-${index}`}
                                    className={styles.YearSpacer}
                                    style={{
                                        width:
                                            getDayWidth() * year.totalDays -
                                            yearLabelWidth,
                                    }}
                                />
                            </>
                        );
                    })}
                </div>
            );
        };

        const renderMonthLabels = () => {
            return (
                <div className={styles.Months}>
                    {months.map((month, index) => {
                        return (
                            <>
                                <div
                                    key={`label-${index}`}
                                    className={styles.MonthOfYearLabel}
                                    style={{
                                        width: Math.min(
                                            getDayWidth() * month.totalDays,
                                            monthLabelWidth,
                                        ),
                                    }}
                                >
                                    {monthOfYearLabel[month.monthOfYear - 1]}
                                </div>
                                <div
                                    key={`spacer-${index}`}
                                    className={styles.MonthSpacer}
                                    style={{
                                        width:
                                            getDayWidth() * month.totalDays -
                                            monthLabelWidth,
                                    }}
                                />
                            </>
                        );
                    })}
                </div>
            );
        };

        const renderWeekLabels = () => {
            return (
                <div className={styles.Weeks}>
                    {weeks.map((week, index) => {
                        return (
                            <>
                                <div
                                    key={`label-${index}`}
                                    className={styles.WeekOfYearLabel}
                                    style={{
                                        width: Math.min(
                                            getDayWidth() * week.totalDays,
                                            weekLabelWidth,
                                        ),
                                    }}
                                >
                                    {`w${week.weekOfYear}`}
                                </div>
                                <div
                                    key={`spacer-${index}`}
                                    className={styles.WeekSpacer}
                                    style={{
                                        width:
                                            getDayWidth() * week.totalDays -
                                            weekLabelWidth,
                                    }}
                                />
                            </>
                        );
                    })}
                </div>
            );
        };

        const renderDayLabels = () => {
            return (
                <div className={styles.Days}>
                    {days.map((day, index) => {
                        return (
                            <>
                                <div
                                    key={index}
                                    className={styles.DayLabel}
                                    style={{
                                        width: getDayWidth(),
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
            );
        };

        const renderDayLines = () => {
            return days.map((day, index) => {
                return (
                    <div
                        key={index}
                        className={`${styles.Spacer} ${classNames({
                            [styles.IncludeStart]: day.includeStart,
                            [styles.IncludeEnd]: day.includeEnd,
                        })}`}
                        style={{
                            width: dayWidth,
                        }}
                    />
                );
            });
        };

        const renderWeekLines = () => {
            return weeks.map((week, index) => {
                return (
                    <div
                        key={index}
                        className={`${styles.Spacer} ${classNames({
                            [styles.IncludeStart]: week.includeStart,
                            [styles.IncludeEnd]: week.includeEnd,
                        })}`}
                        style={{
                            width: weekDayWidth * week.totalDays,
                        }}
                    />
                );
            });
        };

        const renderMonthLines = () => {
            return months.map((month, index) => {
                return (
                    <div
                        key={index}
                        className={`${styles.Spacer} ${classNames({
                            [styles.IncludeStart]: month.includeStart,
                            [styles.IncludeEnd]: month.includeEnd,
                        })}`}
                        style={{
                            width: monthDayWidth * month.totalDays,
                        }}
                    />
                );
            });
        };

        const getDayWidth = () => {
            switch (selectedTimeUnit) {
                case 'day':
                    return dayWidth;
                case 'week':
                    return weekDayWidth;
                case 'month':
                    return monthDayWidth;
            }
        };

        const onSelectTimeUnitOption = (optionKey: string) => {
            setSelectedTimeUnit(optionKey as TimeUnit);
        };

        const currentTimeDiff = moment.duration(
            moment(currTime).diff(moment(props.startAt)),
        );
        const currentTimeLeftOffset = getDayWidth() * currentTimeDiff.asDays();

        return (
            <div className={styles.Timeline}>
                <div className={styles.Controls}>
                    <div className={styles.TimeUnitDropdown}>
                        <DropDownList
                            options={timeUnits}
                            selectOptionKey={selectedTimeUnit}
                            onSelectOption={onSelectTimeUnitOption}
                        />
                    </div>
                </div>
                <div
                    className={`${styles.Scrollable} ${classNames({
                        [styles.Debug]: false,
                    })}`}
                >
                    <div
                        className={`${styles.Labels} ${classNames({
                            [styles.Sticky]: true,
                        })}`}
                    >
                        {renderYearLabels()}
                        {renderMonthLabels()}
                        {selectedTimeUnit == 'week' && renderWeekLabels()}
                        {selectedTimeUnit == 'day' && renderDayLabels()}
                        <div className={styles.Lines}>
                            {selectedTimeUnit == 'day' && renderDayLines()}
                            {selectedTimeUnit == 'week' && renderWeekLines()}
                            {selectedTimeUnit == 'month' && renderMonthLines()}
                        </div>
                    </div>
                    <div className={styles.Content}>
                        <div className={styles.Lines}>
                            {selectedTimeUnit == 'day' && renderDayLines()}
                            {selectedTimeUnit == 'week' && renderWeekLines()}
                            {selectedTimeUnit == 'month' && renderMonthLines()}
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
                        <div className={styles.Marker} />
                        <div className={styles.Line} />
                    </div>
                </div>
            </div>
        );
    },
);
