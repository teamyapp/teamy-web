import React, { Component, ReactNode, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { TextFieldUI } from '@lib/ui/TextField';

import { absoluteRootPath } from '@core/config/routing';
import { Deps } from '@core/dep/deps';
import { GraphSource } from '@core/graph/graphSource';

import styles from './SignUp.component.module.scss';

export const signUpRedirectKey = 'signUpRedirect';

interface Props {
    deps: Deps;
}

export class SignUpComponent extends Component<Props> {
    private readonly graphSource: GraphSource;
    private readonly firstNameTextFieldRef = createRef<TextFieldUI>();
    private readonly lastNameTextFieldRef = createRef<TextFieldUI>();

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
    }

    public render(): ReactNode {
        return (
            <div className={styles.SignUp}>
                <div className={styles.Content}>
                    <div className={styles.Title}>Sign Up</div>
                    <div className={styles.UserName}>
                        <div className={styles.Input}>
                            <TextFieldUI
                                ref={this.firstNameTextFieldRef}
                                label={'First Name'}
                            />
                        </div>
                        <div className={styles.Input}>
                            <TextFieldUI
                                ref={this.lastNameTextFieldRef}
                                label={'Last Name'}
                            />
                        </div>
                    </div>
                    <div className={styles.Actions}>
                        <div className={styles.CreateAccount}>
                            <ButtonUI
                                label={'Create Account'}
                                onClick={this.onCreateAccountClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private onCreateAccountClick = async () => {
        await this.graphSource.createUser({
            firstName: this.firstNameTextFieldRef.current?.value || 'New',
            lastName: this.lastNameTextFieldRef.current?.value || 'User',
        });

        const redirectUrl = localStorage.getItem(signUpRedirectKey);
        localStorage.removeItem(signUpRedirectKey);
        window.location.replace(redirectUrl || absoluteRootPath);
    };
}
