import { CoordTranslator } from '@lib/chart/coordTranslator';
import { DataPoint, Range } from '@lib/chart/data';
import { Drawable, Size } from '@lib/draw/drawables/drawable';
import { Ellipse } from '@lib/draw/drawables/ellipse';
import { Group } from '@lib/draw/drawables/group';
import { Line } from '@lib/draw/drawables/line';
import { PolygonalChain } from '@lib/draw/drawables/polygonalChain';
import { Text } from '@lib/draw/drawables/text';
import { TextMeter } from '@lib/draw/drawables/textMeter';
import { Point } from '@lib/ui/position';

export const LABEL_MARGIN = 14;
export const TITLE_MARGIN = 20;
export const LABEL_MIN_GAP = 10;

const DEBUG = false;

export function makeGrid(
    coordTranslator: CoordTranslator,
    xRange: Range,
    xLineOffset: number,
    gridXGap: number,
    yRange: Range,
    yLineOffset: number,
    gridYGap: number,
    showHorizontalLine: boolean,
    showVerticalLine: boolean,
    color: string,
): Drawable {
    const drawables: Drawable[] = [];
    if (showHorizontalLine) {
        const xRangeLen = xRange.end - xRange.start;
        for (
            let relativeY = yLineOffset;
            relativeY <= yRange.end;
            relativeY += gridYGap
        ) {
            const line = new Line({
                left: coordTranslator.xCoordToDrawRegion(xRange.start),
                top: coordTranslator.yCoordToDrawRegion(relativeY),
            });
            line.width = coordTranslator.xDistanceToDots(xRangeLen);
            line.strokeColor = color;
            drawables.push(line);
        }
    }

    if (showVerticalLine) {
        const yRangeLen = yRange.end - yRange.start;
        for (
            let relativeX = xLineOffset;
            relativeX <= xRange.end;
            relativeX += gridXGap
        ) {
            const line = new Line({
                left: coordTranslator.xCoordToDrawRegion(relativeX),
                top: coordTranslator.yCoordToDrawRegion(yRange.start),
            });
            line.strokeColor = color;
            line.width = coordTranslator.yDistanceToDots(yRangeLen);
            line.rotationAngle = 90;
            drawables.push(line);
        }
    }

    return new Group(drawables);
}

export function makeAxes(
    coordTranslator: CoordTranslator,
    xRange: Range,
    yRange: Range,
    axisColor: string,
): Drawable {
    const drawables: Drawable[] = [];
    const xAxis = new Line({
        left: coordTranslator.xCoordToDrawRegion(xRange.start),
        top: coordTranslator.yCoordToDrawRegion(yRange.start),
    });
    xAxis.strokeColor = axisColor;
    xAxis.thickness = 2;
    xAxis.width = coordTranslator.xDistanceToDots(xRange.end - xRange.start);
    drawables.push(xAxis);

    const yAxis = new Line({
        left: coordTranslator.xCoordToDrawRegion(xRange.start),
        top: coordTranslator.yCoordToDrawRegion(yRange.start),
    });
    yAxis.strokeColor = axisColor;
    yAxis.thickness = 2;
    yAxis.width = coordTranslator.yDistanceToDots(yRange.end - yRange.start);
    yAxis.rotationAngle = 90;
    drawables.push(yAxis);
    return new Group(drawables);
}

export function makeLabels(
    ctx: CanvasRenderingContext2D,
    coordTranslator: CoordTranslator,
    xRange: Range,
    xLabelOffset: number,
    xLabels: string[],
    xLabelGap: number,
    xLabelTitle: string,
    yRange: Range,
    yLabelOffset: number,
    yLabels: string[],
    yLabelGap: number,
    yLabelTitle: string,
): Drawable {
    const drawables: Drawable[] = [];
    const labelTextMeter = new TextMeter(ctx, '16px bold serif');
    for (let index = 0; index < yLabels.length; index++) {
        const yLabel = yLabels[index];
        const textMetrics = labelTextMeter.measureText(yLabel);
        const yLabelSize = {
            width: textMetrics.width,
            height:
                textMetrics.actualBoundingBoxAscent +
                textMetrics.actualBoundingBoxDescent,
        };
        const label = new Text(
            {
                left:
                    coordTranslator.xCoordToDrawRegion(xRange.start) -
                    yLabelSize.width -
                    LABEL_MARGIN,
                top:
                    coordTranslator.yCoordToDrawRegion( yLabelOffset +index * yLabelGap) -
                    yLabelSize.height / 2,
            },
            yLabel,
        );
        label.size = yLabelSize;
        label.fontWeight = 'bold';

        if (DEBUG) {
            label.backgroundColor = 'red';
            label.showCenter = true;
        }

        label.horizontalAlign = 'right';
        drawables.push(label);
    }

    let maxXLabelWidth = 0;
    for (let index = 0; index < xLabels.length; index++) {
        const xLabel = xLabels[index];
        const textMetrics = labelTextMeter.measureText(xLabel);
        maxXLabelWidth = Math.max(maxXLabelWidth, textMetrics.width);
    }

    let xLabelAngle = 0;
    if (
        maxXLabelWidth + LABEL_MIN_GAP >
        coordTranslator.xDistanceToDots(xLabelGap)
    ) {
        xLabelAngle = 45;
    }

    let maxXLabelVerticalHeight = 0;
    for (let index = 0; index < xLabels.length; index++) {
        const xLabel = xLabels[index];
        const textMetrics = labelTextMeter.measureText(xLabel);
        const xLabelSize = {
            width: textMetrics.width,
            height:
                textMetrics.actualBoundingBoxAscent +
                textMetrics.actualBoundingBoxDescent,
        };
        const verticalHeightFromWidth =
            xLabelSize.width * Math.sin((xLabelAngle * Math.PI) / 180);
        const verticalHeightFromHeight =
            xLabelSize.height * Math.cos((xLabelAngle * Math.PI) / 180);
        const xLabelVerticalHeight =
            verticalHeightFromWidth + verticalHeightFromHeight;
        maxXLabelVerticalHeight = Math.max(
            maxXLabelVerticalHeight,
            xLabelVerticalHeight,
        );
        const label = new Text(
            {
                left:

                    coordTranslator.xCoordToDrawRegion(xLabelOffset+index * xLabelGap) -
                    xLabelSize.width / 2,
                top:
                    coordTranslator.yCoordToDrawRegion(yRange.start) +
                    xLabelVerticalHeight / 2 -
                    xLabelSize.height / 2 +
                    LABEL_MARGIN,
            },
            xLabels[index],
        );
        label.size = xLabelSize;
        label.fontWeight = 'bold';
        label.horizontalAlign = 'center';
        label.rotationAngle = xLabelAngle;

        if (DEBUG) {
            label.backgroundColor = 'red';
            label.showCenter = true;
        }

        drawables.push(label);
    }

    const titleTextMeter = new TextMeter(ctx, '20px bold serif');
    const yLabelTitleMeasure = titleTextMeter.measureText(yLabelTitle);
    const yLabelSize: Size = {
        width: yLabelTitleMeasure.width,
        height:
            yLabelTitleMeasure.actualBoundingBoxAscent +
            yLabelTitleMeasure.actualBoundingBoxDescent,
    };
    const yLabelTitleText = new Text(
        {
            left:
                coordTranslator.xCoordToDrawRegion(xRange.start) -
                yLabelSize.width / 2,
            top:
                coordTranslator.yCoordToDrawRegion(yRange.end) -
                yLabelSize.height -
                TITLE_MARGIN,
        },
        yLabelTitle,
    );

    yLabelTitleText.size = yLabelSize;
    yLabelTitleText.fontSize = 20;
    yLabelTitleText.fontWeight = 'bold';
    yLabelTitleText.horizontalAlign = 'right';
    if (DEBUG) {
        yLabelTitleText.backgroundColor = 'green';
        yLabelTitleText.showCenter = true;
    }

    drawables.push(yLabelTitleText);

    const xTitleMarginTop =
        maxXLabelVerticalHeight + LABEL_MARGIN + TITLE_MARGIN;
    const xLabelTitleText = new Text(
        {
            left: coordTranslator.xCoordToDrawRegion(xRange.start),
            top:
                coordTranslator.yCoordToDrawRegion(yRange.start) +
                xTitleMarginTop,
        },
        xLabelTitle,
    );
    const xLabelTitleMeasure = titleTextMeter.measureText(xLabelTitle);
    xLabelTitleText.size = {
        width: coordTranslator.xDistanceToDots(xRange.end - xRange.start),
        height:
            xLabelTitleMeasure.actualBoundingBoxAscent +
            xLabelTitleMeasure.actualBoundingBoxDescent,
    };
    xLabelTitleText.fontSize = 20;
    xLabelTitleText.fontWeight = 'bold';
    xLabelTitleText.horizontalAlign = 'center';
    if (DEBUG) {
        xLabelTitleText.backgroundColor = 'green';
        xLabelTitleText.showCenter = true;
    }

    drawables.push(xLabelTitleText);
    return new Group(drawables);
}

export function makeDataPointMarkers(
    coordTranslator: CoordTranslator,
    dataPoints: DataPoint[],
): Drawable {
    const drawables: Drawable[] = [];
    for (const dataPoint of dataPoints) {
        const markerSize: Size = {
            width: 8,
            height: 8,
        };
        const marker = new Ellipse({
            left:
                coordTranslator.xCoordToDrawRegion(dataPoint.x) -
                markerSize.width / 2,
            top:
                coordTranslator.yCoordToDrawRegion(dataPoint.y) -
                markerSize.height / 2,
        });
        marker.size = markerSize;
        marker.strokeColor = undefined;
        marker.fillColor = '#1976d2';
        drawables.push(marker);
    }

    return new Group(drawables);
}

export function makeCurve(
    coordTranslator: CoordTranslator,
    dataPoints: DataPoint[],
    color: string,
    thickness: number,
): Drawable {
    const drawables: Drawable[] = [];

    const points: Point[] = dataPoints.map((dataPoint) => ({
        left: coordTranslator.xCoordToDrawRegion(dataPoint.x),
        top: coordTranslator.yCoordToDrawRegion(dataPoint.y),
    }));
    const curve = new PolygonalChain(points);
    curve.strokeColor = color;
    curve.thickness = thickness;
    drawables.push(curve);
    return new Group(drawables);
}
