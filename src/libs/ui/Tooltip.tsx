import React, { FC, ReactNode } from 'react';

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
    disabled?: boolean;
}

export const TooltipUI: FC<Props> = ({
    children, 
    message, 
    disabled, 
    relativeLayout, 
    referenceOffset=4,
    verticalAlignment="bottom", 
    horizontalAlignment="center"
}) => {
    if (disabled) {
        return children
    }
    
    return <RelativeLayoutContainerUI 
        relativeLayout={relativeLayout}
        referenceOffset={referenceOffset}
        overSpaceAction='jumpVertically'
        zOffset={TOOLTIP_Z_INDEX}
        horizontalAlignment={horizontalAlignment}
        verticalAlignment={verticalAlignment}
        renderReferenceElement={({openContainer, closeContainer}) => (
            <div className={styles.Reference} onClick={closeContainer} onMouseOver={openContainer} onMouseOut={closeContainer}>
                {children}
            </div>
        )}
        renderFollower={() => (
            <div className={styles.Tooltip}>
                {message}
            </div>
        )}

    
    />

}
