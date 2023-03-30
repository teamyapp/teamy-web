import { Component, ReactNode, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import styles from './ConfirmActionsModal.component.module.scss';

interface Props {
    message: string;
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
                <div className={styles.Content}>
                    <div className={styles.Message}>{this.props.message}</div>
                    <div className={styles.Actions}>
                        <ButtonUI
                            label={'Yes'}
                            className={styles.ConfirmAction}
                            onClick={this.onConfirm}
                        />
                        <ButtonUI
                            label={'No'}
                            className={styles.CancelAction}
                            onClick={this.onCancel}
                        />
                    </div>
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
