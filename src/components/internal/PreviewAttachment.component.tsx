import React, { Component, createRef } from 'react';
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

export class PreviewAttachemntComponent extends Component<Props> {
    private readonly modalRef = createRef<ModalUI>();
    constructor(props: Props) {
        super(props);
    }
    handleClose = () => {
        if (this.modalRef.current) {
            this.modalRef.current.close();
        }
    };

    public render() {
        return (
            <ModalUI ref={this.modalRef} level={2}>
                <div className={styles.Header}>
                    Image Preview
                    <div
                        role={'button'}
                        aria-label={'Close'}
                        className={styles.CloseButton}
                        onClick={this.handleClose}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.ModalContent}>
                    <img src={this.props.attachmentUrl} alt='Preview' />
                </div>
            </ModalUI>
        );
    }

    public open = () => {
        this.modalRef.current?.open();
    };
}