import React, { Component, ReactNode, createRef } from 'react';

import { IdentityClient } from '@lib/identity/Identity.client';
import { ButtonUI } from '@lib/ui/Button';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { absoluteRootPath } from '@core/routing/routes';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './SignUp.component.module.scss';

export const signUpRedirectKey = 'signUpRedirect';

interface Props {
    deps: Deps;
}

interface State {
    showPageContent: boolean;
}

export class SignUpComponent extends Component<Props, State> {
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly identityClient: IdentityClient;
    private readonly firstNameTextFieldRef = createRef<TextFieldUI>();
    private readonly lastNameTextFieldRef = createRef<TextFieldUI>();

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.identityClient = props.deps.identityClient;
        this.state = {
            showPageContent: false,
        };
    }

    public render(): ReactNode {
        return (
            this.state.showPageContent && (
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
                            <div className={styles.SignOut}>
                                <ButtonUI
                                    label={'Sign Out'}
                                    onClick={this.onSignOutClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )
        );
    }

    public componentDidMount() {
        if (this.graphSource.currentUser()) {
            redirectBack();
        } else {
            this.setState({
                showPageContent: true,
            });
        }
    }

    private onCreateAccountClick = async () => {
        await this.stateSyncer.createUser({
            firstName: this.firstNameTextFieldRef.current?.value || 'New',
            lastName: this.lastNameTextFieldRef.current?.value || 'User',
        });
        redirectBack();
    };

    private onSignOutClick = () => {
        this.identityClient.signOut();
    };
}

function redirectBack() {
    const redirectUrl = localStorage.getItem(signUpRedirectKey);
    localStorage.removeItem(signUpRedirectKey);
    window.location.replace(redirectUrl || absoluteRootPath);
}
