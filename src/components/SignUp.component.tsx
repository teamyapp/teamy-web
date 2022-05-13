import { absoluteRootPath } from '@core/config/routing';
import { Deps } from '@core/dep/deps';
import { ButtonUI } from '@lib/ui/Button';
import { TextFieldUI } from '@lib/ui/TextField';
import React, { Component, createRef, ReactNode } from 'react';

import styles from './SignUp.component.module.scss';
import { signUpRedirectKey } from './WithSignUp.component';

interface Props {
    deps: Deps;
}

export class SignUpComponent extends Component<Props> {
    private readonly firstNameTextFieldRef = createRef<TextFieldUI>();
    private readonly lastNameTextFieldRef = createRef<TextFieldUI>();

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
        await this.props.deps.userService.createUser({
            firstName: this.firstNameTextFieldRef.current?.value || 'New',
            lastName: this.lastNameTextFieldRef.current?.value || 'User',
        });

        const redirectUrl = localStorage.getItem(signUpRedirectKey);
        localStorage.removeItem(signUpRedirectKey);
        window.location.replace(redirectUrl || absoluteRootPath);
    };
}
