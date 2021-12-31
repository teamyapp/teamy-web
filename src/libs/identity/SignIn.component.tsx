import React, { Component, ReactElement } from 'react';

import { IdentityClient } from './Identity.client';
import styles from './SignIn.component.module.scss';

interface IProps {
    identityClient: IdentityClient;
    onSignInSucceed?: () => void;
}

export class SignInComponent extends Component<IProps> {
    public render(): ReactElement {
        return (
            <div className={styles.SignInOptions}>
                <div className={styles.SignInOptionsCard}>
                    <div className={styles.Title}>Teamy</div>
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

    private onOAuthSignInButtonClick(
        oauthProviderName: string,
    ): () => Promise<void> {
        return async () => {
            const [sessionID, error] =
                await this.props.identityClient.prepareSignIn();
            if (error) {
                // TODO: show error
                console.log(error);
                return;
            }
            this.props.identityClient.tryOAuthSignIn(
                oauthProviderName,
                sessionID!,
            );
            await this.props.identityClient.waitForSignFinish();
            this.props.onSignInSucceed?.call(null);
        };
    }
}
