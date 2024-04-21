import { CleanupFunc, RequiredAction } from '@teamyapp/ext';
import classNames from 'classnames';
import React, { Component, ReactNode, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import styles from './RequiredActionsModal.component.module.scss';

interface State {
    requiredActions: RequiredAction[];
    currentStepIndex: number;
}

export class RequiredActionsModalComponent extends Component<any, State> {
    private readonly modalRef = createRef<ModalUI>();
    private readonly requiredActionViewRef = createRef<HTMLDivElement>();
    private cleanupFunc?: CleanupFunc;

    constructor(props: any) {
        super(props);
        this.state = {
            requiredActions: [],
            currentStepIndex: 0,
        };
    }

    render() {
        return (
            <ModalUI
                ref={this.modalRef}
                disableClose={true}
                afterClose={this.afterModalClose}
            >
                <div className={styles.Header}>Required Actions</div>
                <div className={styles.Content}>
                    <div className={styles.Stepper}>
                        {this.state.requiredActions.map(this.renderStep)}
                    </div>
                    {this.state.requiredActions.length >
                        this.state.currentStepIndex && (
                        <div
                            className={styles.View}
                            ref={this.requiredActionViewRef}
                        />
                    )}
                </div>
            </ModalUI>
        );
    }

    public open = async (requiredActions: RequiredAction[]) => {
        this.setState({
            requiredActions,
            currentStepIndex: 0,
        });

        await this.modalRef.current?.open();
        this.tryRenderStep(0);
    };

    public completeCurrentStep = () => {
        const prevIndex = this.state.currentStepIndex;
        if (prevIndex === this.state.requiredActions.length - 1) {
            this.modalRef.current?.close();
            return;
        }

        const newStepIndex = this.state.currentStepIndex + 1;
        this.setState(
            {
                currentStepIndex: newStepIndex,
            },
            () => {
                this.cleanupFunc?.();
                this.tryRenderStep(newStepIndex);
            },
        );
    };

    private tryRenderStep = (step: number) => {
        if (
            this.state.requiredActions.length > step &&
            this.requiredActionViewRef.current
        ) {
            this.cleanupFunc = this.state.requiredActions[step].renderView(
                this.requiredActionViewRef.current,
            );
        }
    };

    private afterModalClose = () => {
        this.cleanupFunc?.();
    };

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
