import { Range } from '@lib/chart/data';
import { Size } from '@lib/draw/drawables/drawable';
import { Point } from '@lib/ui/position';

export class CoordTranslator {
    private readonly xDotsPerUnit: number;
    private readonly yDotsPerUnit: number;

    constructor(
        private drawRegionSize: Size,
        private drawRegionPosition: Point,
        private xRange: Range,
        private yRange: Range,
    ) {
        this.xDotsPerUnit =
            drawRegionSize.width / Math.abs(xRange.end - xRange.start);
        this.yDotsPerUnit =
            drawRegionSize.height / Math.abs(yRange.end - yRange.start);
    }

    xCoordToDrawRegion(xCoordinate: number): number {
        return (
            this.drawRegionPosition.left +
            (xCoordinate - this.xRange.start) * this.xDotsPerUnit
        );
    }

    yCoordToDrawRegion(yCoordinate: number): number {
        return (
            this.drawRegionPosition.top +
            this.drawRegionSize.height -
            (yCoordinate - this.yRange.start) * this.yDotsPerUnit
        );
    }

    xDistanceToDots(xDistance: number): number {
        return xDistance * this.xDotsPerUnit;
    }

    yDistanceToDots(yDistance: number): number {
        return yDistance * this.yDotsPerUnit;
    }
}
