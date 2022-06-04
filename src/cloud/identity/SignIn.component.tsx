import React, { Component, ReactNode } from 'react';

import { IdentityClient } from '@lib/identity/Identity.client';
import { Router } from '@lib/router/router';

import styles from './SignIn.component.module.scss';

interface Props {
    router: Router;
    identityClient: IdentityClient;
}

interface State {
    showPageContent: boolean;
}

export class SignInComponent extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showPageContent: false,
        };
    }

    public render(): ReactNode {
        return (
            this.state.showPageContent && (
                <div className={styles.SignInOptions}>
                    <div className={styles.SignInOptionsCard}>
                        <div className={styles.Title}>Sign In</div>
                        <div
                            className={`${styles.Button} ${styles.Google}`}
                            onClick={this.onOAuthSignInButtonClick('google')}
                        >
                            Sign in with Google
                        </div>
                        <div
                            className={`${styles.Button} ${styles.Github}`}
                            onClick={this.onOAuthSignInButtonClick('github')}
                        >
                            Sign in with Github
                        </div>
                    </div>
                </div>
            )
        );
    }

    public async componentDidMount() {
        const isSignedIn = await this.props.identityClient.isSignedIn();
        if (isSignedIn) {
            this.props.identityClient.redirectBack();
        } else {
            this.setState({
                showPageContent: true
            });
        }
    }

    private onOAuthSignInButtonClick(authProvider: string): () => void {
        return async () => {
            this.props.identityClient.tryOAuthSignIn(authProvider);
        };
    }
}
