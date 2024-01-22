import classNames from 'classnames';
import React, { Component, ReactNode, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { RequiredAction } from '@teamyapp/ext';

import styles from './RequiredActionsModal.component.module.scss';

interface State {
    requiredActions: RequiredAction[];
    currentStepIndex: number;
}

export class RequiredActionsModalComponent extends Component<any, State> {
    private readonly modalRef = createRef<ModalUI>();

    constructor(props: any) {
        super(props);
        this.state = {
            requiredActions: [],
            currentStepIndex: 0,
        };
    }

    render() {
        return (
            <ModalUI ref={this.modalRef} disableClose={true}>
                <div className={styles.Header}>Required Actions</div>
                <div className={styles.Content}>
                    <div className={styles.Stepper}>
                        {this.state.requiredActions.map(this.renderStep)}
                    </div>
                    {this.state.requiredActions.length >
                        this.state.currentStepIndex && (
                        <div className={styles.View}>
                            {
                                this.state.requiredActions[
                                    this.state.currentStepIndex
                                ].view
                            }
                        </div>
                    )}
                </div>
            </ModalUI>
        );
    }

    public open(requiredActions: RequiredAction[]) {
        this.setState({
            requiredActions,
            currentStepIndex: 0,
        });

        this.modalRef.current?.open();
    }

    public completeCurrentStep() {
        const prevIndex = this.state.currentStepIndex;
        this.setState({
            currentStepIndex: this.state.currentStepIndex + 1,
        });
        if (prevIndex === this.state.requiredActions.length - 1) {
            this.modalRef.current?.close();
        }
    }

    private renderStep = (
        requiredAction: RequiredAction,
        index: number,
    ): ReactNode => {
        const completed = index < this.state.currentStepIndex;
        const active = index === this.state.currentStepIndex;
        return (
            <div
                className={`${styles.Step} ${classNames({
                    [styles.Completed]: completed,
                    [styles.Active]: active,
                })}`}
                key={index}
            >
                <div className={styles.Icon}>
                    {completed ? (
                        <MaterialIconUI>check</MaterialIconUI>
                    ) : (
                        index + 1
                    )}
                </div>
                <div className={styles.ActionName}>
                    {requiredAction.actionName}
                </div>
            </div>
        );
    };
}
