import React from 'react';
import { ModalUI } from '@lib/ui/Modal';
import {
    ForwardRefExoticComponent,
    ForwardedRef,
    forwardRef,
    useImperativeHandle,
    useRef,
} from 'react';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import styles from './PreviewAttachment.component.module.scss';


interface Props {
    attachmentUrl?: string;
}

export interface PreviewAttachemntComponentHandle {
    open: () => void;
}

export const PreviewAttachemntComponent: ForwardRefExoticComponent<
    Props & React.RefAttributes<PreviewAttachemntComponentHandle>
> = forwardRef(
    (props: Props, ref: ForwardedRef<PreviewAttachemntComponentHandle>) => {
        const modalRef = useRef<ModalUI>(null);
        const open = () => {
            modalRef.current?.open();
        };
        useImperativeHandle(ref, () => ({
            open,
        }));

        return <ModalUI ref={modalRef} level={2}>
            <div className={styles.Header}>
                Image Preview
                <div
                    role={'button'}
                    aria-label={'Close'}
                    className={styles.CloseButton}
                    onClick={modalRef.current?.close}
                >
                    <MaterialIconUI>cancel</MaterialIconUI>
                </div>
            </div>
            <div className={styles.ModalContent}>
                <img src={props.attachmentUrl} alt="Preview" />
            </div>
        </ModalUI>
    },
);

