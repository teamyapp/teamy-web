import { Component } from 'react';

import { ProductivityOverviewDashboardComponent } from '../internal/dashboards/ProductivityOverviewDashboard.component';
import styles from './Insights.component.module.scss';

export class InsightsComponent extends Component {
    render() {
        return (
            <div className={styles.Insights}>
                <div className={styles.Dashboard}>
                    <ProductivityOverviewDashboardComponent />
                </div>
            </div>
        );
    }
}
