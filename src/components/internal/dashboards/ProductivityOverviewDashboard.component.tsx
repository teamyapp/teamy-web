import { Component } from 'react';

import { DataPoint, Range } from '@lib/chart/data';
import { LineChart } from '@lib/chart/line.chart';

import styles from './ProductivityOverviewDashboard.component.module.scss';

const yLabels: string[] = ['0', '20', '40', '60', '80', '100', '120', '140'];

const xLabels: string[] = [
    '07/25',
    '08/01',
    '08/08',
    '08/15',
    '08/22',
    '08/29',
    '09/15',
    '09/11',
    '09/19',
    '09/26',
    '10/03',
    '10/10',
    '10/17',
    '10/24',
];

const dataPoints: DataPoint[] = [
    {
        x: 0,
        y: 100,
    },
    {
        x: 1,
        y: 120,
    },
    {
        x: 2,
        y: 80,
    },
    {
        x: 3,
        y: 40,
    },
    {
        x: 4,
        y: 53,
    },
    {
        x: 5,
        y: 70,
    },
    {
        x: 6,
        y: 90,
    },
    {
        x: 7,
        y: 140,
    },
    {
        x: 8,
        y: 60,
    },
];

const xRange: Range = {
    start: 0,
    end: 13,
};
const yRange: Range = {
    start: 0,
    end: 150,
};

export class ProductivityOverviewDashboardComponent extends Component {
    render() {
        return (
            <div className={styles.Dashboard}>
                <div className={styles.Title}>Productivity Overview</div>
                <div className={styles.Chart}>
                    <LineChart
                        xRange={xRange}
                        yRange={yRange}
                        dataPoints={dataPoints}
                        xLabels={xLabels}
                        yLabels={yLabels}
                        xLabelGap={1}
                        yLabelGap={20}
                        xLabelTitle={'Start Of Week'}
                        yLabelTitle={'Delivered'}
                        yLabelMaxWidth={60}
                        gridSize={{
                            width: 500,
                            height: 300,
                        }}
                        gridXGap={1}
                        gridYGap={20}
                    />
                </div>
            </div>
        );
    }
}
