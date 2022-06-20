import { Comparison } from './comparison';
import { DataType } from './dataType';

export class AttributeMatcher {
    constructor(
        public attributeName: string,
        public dataType: DataType,
        public comparison: Comparison,
        public pattern?: string,
    ) {}

    toJson(): any {
        return {
            AttributeName: this.attributeName,
            DataType: this.dataType,
            Comparison: this.comparison,
            Pattern: this.pattern,
        };
    }

    static fromJson(json: any): AttributeMatcher {
        return new AttributeMatcher(
            json.AttributeName,
            json.DataType,
            json.Comparison,
            json.Pattern,
        );
    }
}
