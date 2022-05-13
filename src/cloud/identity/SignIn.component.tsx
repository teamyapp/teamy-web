import React, { Component, ReactNode } from 'react';

import { IdentityClient } from '@lib/identity/Identity.client';
import { Router } from '@lib/router/router';

import styles from './SignIn.component.module.scss';

interface Props {
    router: Router;
    identityClient: IdentityClient;
}

export class SignInComponent extends Component<Props> {
    public render(): ReactNode {
        return (
            <div className={styles.SignInOptions}>
                <div className={styles.SignInOptionsCard}>
                    <div className={styles.Title}>Sign In</div>
                    <div
                        className={`${styles.Button} ${styles.Google}`}
                        onClick={this.onOAuthSignInButtonClick('google')}
                    >
                        Sign in with Google
                    </div>
                </div>
            </div>
        );
    }

    private onOAuthSignInButtonClick(authProvider: string): () => void {
        return async () => {
            this.props.identityClient.tryOAuthSignIn(authProvider);
        };
    }
}
