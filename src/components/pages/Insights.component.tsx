import { Component } from 'react';

import { ProductivityOverviewDashboardComponent } from '../internal/Dashboards/ProductivityOverviewDashboard.component';
import styles from './Insights.component.module.scss';
import { Deps } from '@core/dep/deps';

interface Props {
    deps: Deps;
}

export class InsightsComponent extends Component<Props> {
    render() {
        return (
            <div className={styles.Insights}>
                <div className={styles.Dashboard}>
                    <ProductivityOverviewDashboardComponent deps={this.props.deps}/>
                </div>
            </div>
        );
    }
}
