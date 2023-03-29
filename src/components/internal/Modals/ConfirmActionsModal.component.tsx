import { Component, ReactNode, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import styles from './ConfirmActionsModal.component.module.scss';

interface Props {
    alert: string;
    onConfirm: () => any;
}

export class ConfirmActionsModalComponent extends Component<Props> {
    private readonly modalRef = createRef<ModalUI>();

    render(): ReactNode {
        return (
            <ModalUI ref={this.modalRef} level={1}>
                <div className={styles.Header}>
                    Confirm
                    <div className={styles.CloseButton} onClick={this.onCancel}>
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>{this.props.alert}</div>
                <div className={styles.ActionFooter}>
                    <ButtonUI label={'Yes'} onClick={this.onConfirm} />
                    <ButtonUI label={'No'} onClick={this.onCancel} />
                </div>
            </ModalUI>
        );
    }

    public open = () => {
        this.modalRef.current?.open();
    };

    private onConfirm = () => {
        this.props.onConfirm();
        this.modalRef.current?.close();
    };

    private onCancel = () => {
        this.modalRef.current?.close();
    };
}
