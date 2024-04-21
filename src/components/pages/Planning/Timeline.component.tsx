import classNames from 'classnames';
import moment, { Moment } from 'moment';
import {
    ForwardedRef,
    ReactElement,
    RefObject,
    createRef,
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
import { RelativeLayout } from '@lib/layout';

const debug = false;

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

const sidePadding = 14;
const labelLineHeight = 8;

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
    relativeLayout: RelativeLayout;
}

export interface TimelineComponentHandle {
    showAndSelectItem: (rowIndex: number, itemIndex: number) => void;
    deselectItem: (rowIndex: number, itemIndex: number) => void;
}

export const TimelineComponent = forwardRef(
    (props: Props, ref: ForwardedRef<TimelineComponentHandle>) => {
        const rowRefs: RefObject<any>[][] = props.rows.map((row) =>
            row.items.map((item) => createRef()),
        );
        const labelsContentRef = useRef<HTMLDivElement>(null);
        const labelsSpacerRef = useRef<HTMLDivElement>(null);
        const linesRef = useRef<HTMLDivElement>(null);
        const linesSpacerRef = useRef<HTMLDivElement>(null);
        const bottomRef = useRef<HTMLDivElement>(null);
        const currentTimeRef = useRef<HTMLDivElement>(null);

        let [days, setDays] = useState<Day[]>([]);
        let [weeks, setWeeks] = useState<Week[]>([]);
        let [months, setMonths] = useState<Month[]>([]);
        let [years, setYears] = useState<Year[]>([]);
        let [currTime, setCurrTime] = useState<Date>(new Date());
        let [selectedItem, setSelectedItem] = useState<SelectedItem>();
        let [selectedTimeUnit, setSelectedTimeUnit] = useState<TimeUnit>('day');

        const onItemClickHandler = (rowIndex: number, itemIndex: number) => {
            return () => {
                rowRefs[rowIndex][itemIndex].current.scrollIntoView({
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
                rowRefs[rowIndex][itemIndex].current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });
                setSelectedItem({
                    rowIndex,
                    itemIndex,
                });
            },
            deselectItem: (rowIndex: number, itemIndex: number) => {
                setSelectedItem(undefined);
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
                rowRefs[selectedItem.rowIndex][
                    selectedItem.itemIndex
                ].current.scrollIntoView({
                    block: 'center',
                    inline: 'center',
                });
            }
        }, [selectedTimeUnit]);

        useEffect(() => {
            const resizeObserver = new ResizeObserver(resizeViews);
            if (labelsContentRef.current) {
                resizeObserver.observe(labelsContentRef.current);
            }

            return () => resizeObserver.disconnect();
        }, [labelsContentRef]);
        useEffect(() => {
            const resizeObserver = new ResizeObserver(resizeViews);
            if (linesRef.current) {
                resizeObserver.observe(linesRef.current);
            }

            return () => resizeObserver.disconnect();
        }, [linesRef]);
        useEffect(() => {
            const resizeObserver = new ResizeObserver(resizeViews);
            if (bottomRef.current) {
                resizeObserver.observe(bottomRef.current);
            }

            return () => resizeObserver.disconnect();
        }, [bottomRef]);

        const renderItem = (
            rowIndex: number,
            timelineStartAtMoment: Moment,
            timelineEndAtMoment: Moment,
        ) => {
            return (item: Item, index: number) => {
                const itemStartAtMoment = moment(item.startAt);
                const itemEndAtMoment = moment(item.endAt);
                if (
                    itemEndAtMoment.isBefore(timelineStartAtMoment) ||
                    itemStartAtMoment.isAfter(timelineEndAtMoment)
                ) {
                    return null;
                }

                const startOffset = moment(itemStartAtMoment).diff(
                    startAtMoment,
                    'days',
                );
                const scaledDayWidth = getDayWidth();
                const left = scaledDayWidth * startOffset;
                const duration = moment.duration(
                    itemEndAtMoment.diff(itemStartAtMoment),
                );
                const width = scaledDayWidth * duration.asDays();
                const selected =
                    selectedItem?.rowIndex === rowIndex &&
                    selectedItem?.itemIndex === index;
                return (
                    <div
                        key={index}
                        ref={rowRefs[rowIndex][index]}
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

        const renderRow = (startAtMoment: Moment, endAtMoment: Moment) => {
            return (row: Row, index: number) => {
                return (
                    <div
                        key={index}
                        className={styles.Row}
                        style={{
                            height: row.height,
                        }}
                    >
                        {row.items.map(
                            renderItem(index, startAtMoment, endAtMoment),
                        )}
                    </div>
                );
            };
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
                                        width: yearLabelWidth,
                                    }}
                                >
                                    {year.yearOf}
                                </div>
                                <div
                                    key={`spacer-${index}`}
                                    className={styles.YearSpacer}
                                    style={{
                                        width: Math.max(
                                            getDayWidth() * year.totalDays -
                                                yearLabelWidth,
                                            0,
                                        ),
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
                                        width: monthLabelWidth,
                                    }}
                                >
                                    {monthOfYearLabel[month.monthOfYear - 1]}
                                </div>
                                <div
                                    key={`spacer-${index}`}
                                    className={styles.MonthSpacer}
                                    style={{
                                        width: Math.max(
                                            getDayWidth() * month.totalDays -
                                                monthLabelWidth,
                                            0,
                                        ),
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
                                        width: weekLabelWidth,
                                    }}
                                >
                                    {`w${week.weekOfYear}`}
                                </div>
                                <div
                                    key={`spacer-${index}`}
                                    className={styles.WeekSpacer}
                                    style={{
                                        width: Math.max(
                                            getDayWidth() * week.totalDays -
                                                weekLabelWidth,
                                            0,
                                        ),
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

        const resizeViews = () => {
            const bottomWidth = bottomRef.current?.offsetWidth || 0;
            const bottomHeight = bottomRef.current?.offsetHeight || 0;
            const labelsContentHeight =
                labelsContentRef.current?.offsetHeight || 0;
            const totalSidePadding = 2 * sidePadding;

            if (labelsSpacerRef.current) {
                const labelContentWidth =
                    labelsContentRef.current?.offsetWidth || 0;
                if (labelContentWidth < bottomWidth) {
                    let spacerWidth =
                        bottomWidth - labelContentWidth - totalSidePadding;
                    labelsSpacerRef.current.style.width = `${spacerWidth}px`;
                } else {
                    labelsSpacerRef.current.style.width = '0';
                }
            }

            if (linesSpacerRef.current) {
                const linesWidth = linesRef.current?.offsetWidth || 0;
                if (linesWidth < bottomWidth) {
                    linesSpacerRef.current.style.width = `${
                        bottomWidth - linesWidth - totalSidePadding
                    }px`;
                } else {
                    linesSpacerRef.current.style.width = '0';
                }
            }

            if (currentTimeRef.current) {
                const currentTimeHeight =
                    bottomHeight -
                    labelsContentHeight -
                    sidePadding +
                    labelLineHeight;
                currentTimeRef.current.style.height = `${currentTimeHeight}px`;
            }
        };

        const currentTimeMoment = moment(currTime);
        const startAtMoment = moment(props.startAt);
        const endAtMoment = moment(props.endAt);

        let showCurrentTime = false;
        let currentTimeLeftOffset = 0;
        if (
            startAtMoment.isSameOrBefore(currentTimeMoment) &&
            endAtMoment.isSameOrAfter(currentTimeMoment)
        ) {
            const currentTimeDiff = moment.duration(
                moment(currTime).diff(moment(props.startAt)),
            );
            currentTimeLeftOffset = getDayWidth() * currentTimeDiff.asDays();
            showCurrentTime = true;
        }

        return (
            <div className={styles.Timeline}>
                <div className={styles.Controls}>
                    <div className={styles.TimeUnitDropdown}>
                        <DropDownList
                            relativeLayout={props.relativeLayout}
                            options={timeUnits}
                            selectOptionKey={selectedTimeUnit}
                            onSelectOption={onSelectTimeUnitOption}
                        />
                    </div>
                </div>
                <div className={styles.Bottom} ref={bottomRef}>
                    <div className={`${styles.Scrollable} ${classNames({})}`}>
                        <div className={styles.Labels}>
                            <div
                                className={`${
                                    styles.LabelsContent
                                } ${classNames({
                                    [styles.Sticky]: true,
                                })}`}
                                ref={labelsContentRef}
                            >
                                {renderYearLabels()}
                                {renderMonthLabels()}
                                {selectedTimeUnit == 'week' &&
                                    renderWeekLabels()}
                                {selectedTimeUnit == 'day' && renderDayLabels()}
                                <div className={styles.Lines}>
                                    {selectedTimeUnit == 'day' &&
                                        renderDayLines()}
                                    {selectedTimeUnit == 'week' &&
                                        renderWeekLines()}
                                    {selectedTimeUnit == 'month' &&
                                        renderMonthLines()}
                                </div>
                            </div>
                            <div
                                className={styles.LabelsSpacer}
                                ref={labelsSpacerRef}
                            />
                        </div>
                        <div className={styles.Content}>
                            <div className={styles.Lines} ref={linesRef}>
                                {selectedTimeUnit == 'day' && renderDayLines()}
                                {selectedTimeUnit == 'week' &&
                                    renderWeekLines()}
                                {selectedTimeUnit == 'month' &&
                                    renderMonthLines()}
                            </div>
                            <div
                                className={styles.LinesSpacer}
                                ref={linesSpacerRef}
                            />
                            <div className={styles.Rows}>
                                {props.rows.map(
                                    renderRow(startAtMoment, endAtMoment),
                                )}
                            </div>
                        </div>
                        <div
                            ref={currentTimeRef}
                            className={`${styles.CurrentTime} ${classNames({
                                [styles.Show]: showCurrentTime,
                            })}`}
                            style={{
                                left: currentTimeLeftOffset,
                            }}
                        >
                            <div className={styles.Marker} />
                            <div className={styles.Line} />
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);
