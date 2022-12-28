import moment from 'moment';
import { Component } from 'react';

import { DropDownList, Option } from '@lib/ui/DropDownList';

import { Deps } from '@core/dep/deps';

import { ProductivityOverviewDashboardComponent } from '../internal/Dashboards/ProductivityOverviewDashboard.component';
import styles from './Insights.component.module.scss';

const defaultTimeRangeKey = 'past-1-month';
const timeRangeOptions: Option[] = [
    {
        key: 'past-1-week',
        description: 'Past 1 week',
    },
    {
        key: 'past-2-weeks',
        description: 'Past 2 weeks',
    },
    {
        key: 'past-3-weeks',
        description: 'Past 3 weeks',
    },
    {
        key: 'past-1-month',
        description: 'Past 1 month',
    },
    {
        key: 'past-2-months',
        description: 'Past 2 months',
    },
    {
        key: 'past-3-months',
        description: 'Past 3 months',
    },
];

interface Props {
    deps: Deps;
}

interface State {
    startTime: Date;
    endTime: Date;
}

export class InsightsComponent extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            startTime: new Date(),
            endTime: new Date(),
        };
    }

    render() {
        return (
            <div className={styles.Insights}>
                <div className={styles.ToolBar}>
                    <div className={styles.Spacer} />
                    <div className={styles.RightSection}>
                        <DropDownList
                            options={timeRangeOptions}
                            selectOptionKey={defaultTimeRangeKey}
                            onSelectOption={this.onTimeRangeSelect}
                        />
                    </div>
                </div>
                <div className={styles.DashboardSection}>
                    <div className={styles.Dashboards}>
                        <div className={styles.Dashboard}>
                            <ProductivityOverviewDashboardComponent
                                deps={this.props.deps}
                                startTime={this.state.startTime}
                                endTime={this.state.endTime}
                            />
                        </div>
                        <div className={styles.Dashboard}></div>
                        <div className={styles.Dashboard}></div>
                        <div className={styles.Dashboard}></div>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.onTimeRangeSelect(defaultTimeRangeKey);
    }

    private onTimeRangeSelect = (optionKey: string) => {
        switch (optionKey) {
            case 'past-1-week': {
                const endTime = new Date();
                this.setState({
                    startTime: moment(endTime).subtract('1', 'week').toDate(),
                    endTime: endTime,
                });
                break;
            }
            case 'past-2-weeks': {
                const endTime = new Date();
                this.setState({
                    startTime: moment(endTime).subtract('2', 'weeks').toDate(),
                    endTime: endTime,
                });
                break;
            }
            case 'past-3-weeks': {
                const endTime = new Date();
                this.setState({
                    startTime: moment(endTime).subtract('3', 'weeks').toDate(),
                    endTime: endTime,
                });
                break;
            }
            case 'past-1-month': {
                const endTime = new Date();
                this.setState({
                    startTime: moment(endTime).subtract('1', 'month').toDate(),
                    endTime: endTime,
                });
                break;
            }
            case 'past-2-months': {
                const endTime = new Date();
                this.setState({
                    startTime: moment(endTime).subtract('2', 'months').toDate(),
                    endTime: endTime,
                });
                break;
            }
            case 'past-3-months': {
                const endTime = new Date();
                this.setState({
                    startTime: moment(endTime).subtract('3', 'months').toDate(),
                    endTime: endTime,
                });
                break;
            }
        }
    };
}
