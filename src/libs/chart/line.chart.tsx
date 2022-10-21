import { Component, createRef } from 'react';

import { CoordTranslator } from '@lib/chart/coordTranslator';
import { DataPoint, Range } from '@lib/chart/data';
import {
    LABEL_MARGIN,
    makeAxes,
    makeCurve,
    makeDataPointMarkers,
    makeGrid,
    makeLabels,
} from '@lib/chart/visual';
import { Canvas } from '@lib/draw/Canvas';
import { Drawable, Size } from '@lib/draw/drawables/drawable';
import { Group } from '@lib/draw/drawables/group';
import { Point } from '@lib/ui/position';

import styles from './line.chart.module.scss';

interface Props {
    xRange: Range;
    yRange: Range;
    dataPoints: DataPoint[];
    xLabels: string[];
    yLabels: string[];
    xLabelGap: number;
    yLabelGap: number;
    xLabelTitle: string;
    yLabelTitle: string;
    yLabelMaxWidth: number;
    gridSize: Size;
    gridXGap: number;
    gridYGap: number;
}

export class LineChart extends Component<Props> {
    private readonly canvasRef = createRef<HTMLCanvasElement>();
    private canvas?: Canvas;

    render() {
        return (
            <div className={styles.LineChart}>
                <canvas ref={this.canvasRef} className={styles.Canvas} />
            </div>
        );
    }

    componentDidMount() {
        if (this.canvasRef.current) {
            this.canvas = new Canvas(this.canvasRef.current);

            const {
                xRange,
                yRange,
                dataPoints,
                xLabels,
                yLabels,
                xLabelGap,
                yLabelGap,
                xLabelTitle,
                yLabelTitle,
                yLabelMaxWidth,
                gridSize,
                gridXGap,
                gridYGap,
            } = this.props;
            const gridDrawRegionPosition: Point = {
                left: yLabelMaxWidth + LABEL_MARGIN,
                top: 40,
            };

            const coordTranslator = new CoordTranslator(
                gridSize,
                gridDrawRegionPosition,
                xRange,
                yRange,
            );

            const components: Drawable[] = [];
            const grid = makeGrid(
                coordTranslator,
                xRange,
                yRange,
                gridXGap,
                gridYGap,
                true,
                true,
                '#eeeeee',
            );
            components.push(grid);

            const axes = makeAxes(coordTranslator, xRange, yRange, '#bdbdbd');
            components.push(axes);

            const labels = makeLabels(
                this.canvas.context,
                coordTranslator,
                xRange,
                yRange,
                xLabelTitle,
                xLabels,
                yLabelTitle,
                yLabels,
                xLabelGap,
                yLabelGap,
            );
            components.push(labels);

            const curve = makeCurve(coordTranslator, dataPoints);
            components.push(curve);

            const dataPointMarkers = makeDataPointMarkers(
                coordTranslator,
                dataPoints,
            );
            components.push(dataPointMarkers);

            const chart = new Group(components);
            const page = this.canvas.getPage(0);
            page.add(chart);

            this.canvas.clearAndDraw();
        }
    }
}
