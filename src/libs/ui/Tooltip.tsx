import React, { FC, Fragment, ReactElement, ReactNode } from 'react';

import styles from './Tooltip.module.scss';
import { RelativeLayout, RelativeLayoutContainerUI } from '@lib/layout';
import { HorizontalAlignment, VerticalAlignment } from '@lib/layout/relativeLayout';

const TOOLTIP_Z_INDEX = 1002;

interface Props {
    children: ReactNode;
    relativeLayout: RelativeLayout;
    message: string;
    horizontalAlignment?: HorizontalAlignment;
    verticalAlignment?: VerticalAlignment;
    referenceOffset?: number;
    preserveReferenceParentHeight?: boolean;
    preserveReferenceParentWidth?: boolean;
    disabled?: boolean;
}

export const TooltipUI: FC<Props> = (props: Props): ReactElement => {
    if (props.disabled) {
        return (
            <div style={{
                width: props.preserveReferenceParentWidth ? '100%' : 'auto',
                height: props.preserveReferenceParentHeight ? '100%' : 'auto',
            }}>
                {props.children}
            </div>
        );
    }

    return <RelativeLayoutContainerUI
        relativeLayout={props.relativeLayout}
        referenceOffset={props.referenceOffset || 4}
        overSpaceAction="jumpVertically"
        zOffset={TOOLTIP_Z_INDEX}
        preserveReferenceParentHeight={props.preserveReferenceParentHeight}
        preserveReferenceParentWidth={props.preserveReferenceParentWidth}
        horizontalAlignment={props.horizontalAlignment}
        verticalAlignment={props.verticalAlignment}
        renderReferenceElement={({ openContainer, closeContainer }) => (
            <div className={styles.Reference}
                 onClick={closeContainer}
                 onMouseOver={openContainer}
                 onMouseOut={closeContainer}>
                {props.children}
            </div>
        )}
        renderFollower={() => (
            <div className={styles.Tooltip}>
                {props.message}
            </div>
        )}
    />;
};
