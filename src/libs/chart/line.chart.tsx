import { Component, ReactNode, createRef } from 'react';

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

export interface DataLine {
    name?: string;
    color: string;
    dataPoints: DataPoint[];
}

interface Props {
    lines: DataLine[];
    xRange: Range;
    xLineOffset: number;
    xLabelOffset: number;
    xLabels: string[];
    xLabelGap: number;
    xLabelTitle: string;
    yRange: Range;
    yLineOffset: number;
    yLabelOffset: number;
    yLabels: string[];
    yLabelGap: number;
    yLabelTitle: string;
    yLabelMaxWidth: number;
    gridHeight: number;
    gridXGap: number;
    gridYGap: number;
    gridYMarginRight: number;
}

export class LineChart extends Component<Props> {
    private readonly canvasRef = createRef<HTMLCanvasElement>();
    private canvas?: Canvas;

    render() {
        return (
            <div className={styles.LineChart}>
                <div className={styles.CanvasSection}>
                    <canvas ref={this.canvasRef} className={styles.Canvas} />
                </div>
                <div className={styles.AnnotationSection}>
                    {this.props.lines.map(this.renderLineAnnotation)}
                </div>
            </div>
        );
    }

    componentDidMount() {
        if (this.canvasRef.current) {
            this.canvas = new Canvas(this.canvasRef.current);
            this.redrawChart();
        }

        window.addEventListener('resize', this.onWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize);
    }

    componentDidUpdate(
        prevProps: Readonly<Props>,
        prevState: Readonly<{}>,
        snapshot?: any,
    ) {
        this.redrawChart();
    }

    private redrawChart() {
        if (!this.canvas) {
            return;
        }

        const {
            lines,
            xRange,
            xLineOffset,
            xLabelOffset,
            xLabels,
            xLabelGap,
            xLabelTitle,
            yRange,
            yLineOffset,
            yLabelOffset,
            yLabels,
            yLabelGap,
            yLabelTitle,
            yLabelMaxWidth,
            gridHeight,
            gridXGap,
            gridYGap,
            gridYMarginRight,
        } = this.props;
        const gridDrawRegionPosition: Point = {
            left: yLabelMaxWidth + LABEL_MARGIN,
            top: 40,
        };

        const gridWidth =
            this.canvasRef.current!.offsetWidth -
            yLabelMaxWidth -
            LABEL_MARGIN -
            gridYMarginRight;
        const gridSize: Size = {
            height: gridHeight,
            width: gridWidth,
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
            xLineOffset,
            gridXGap,
            yRange,
            yLineOffset,
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
            xLabelOffset,
            xLabels,
            xLabelGap,
            xLabelTitle,
            yRange,
            yLabelOffset,
            yLabels,
            yLabelGap,
            yLabelTitle,
        );
        components.push(labels);

        for (const line of lines) {
            const curve = makeCurve(
                coordTranslator,
                line.dataPoints,
                line.color,
                2,
            );
            components.push(curve);
            const dataPointMarkers = makeDataPointMarkers(
                coordTranslator,
                line.dataPoints,
            );
            components.push(dataPointMarkers);
        }

        const chart = new Group(components);
        const page = this.canvas.getPage(0);
        page.removeAll();
        page.add(chart);

        this.canvas.clearAndDraw();
    }

    private onWindowResize = () => {
        this.canvas?.resize();
        this.redrawChart();
    };

    private renderLineAnnotation = (
        line: DataLine,
        index: number,
    ): ReactNode => {
        return (
            line.name && (
                <div className={styles.LineAnnotation} key={index}>
                    <div
                        className={styles.ColorSymbol}
                        style={{ backgroundColor: line.color }}
                    />
                    <div className={styles.Name}>{line.name}</div>
                </div>
            )
        );
    };
}
