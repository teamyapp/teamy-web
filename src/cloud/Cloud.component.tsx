import React, { Component, ReactNode } from 'react';

import {
    IdentityClient,
    accessTokenParam,
} from '@lib/identity/Identity.client';
import { Route } from '@lib/router/Route';
import { Router } from '@lib/router/router';

import { signInFinishPath, signInPath } from '@core/config/routing';
import { Deps } from '@core/dep/deps';

import { SignInComponent } from './identity/SignIn.component';

interface Props {
    deps: Deps;
}

export class CloudComponent extends Component<Props> {
    private readonly router: Router;
    private readonly identityClient: IdentityClient;

    constructor(props: Props) {
        super(props);
        this.router = this.props.deps.router;
        this.identityClient = this.props.deps.identityClient;
    }

    public async componentDidMount() {
        this.router.registerRoute(signInFinishPath);
        const routeChangeCh = this.router.subscribeRouteChange();

        (async () => {
            while (true) {
                const routeUpdate = await routeChangeCh.pop();
                if (routeUpdate?.routePattern === signInFinishPath) {
                    this.identityClient.finishSignIn(
                        routeUpdate.params.queryParams[accessTokenParam],
                    );
                }
            }
        })().then();
    }

    public render(): ReactNode {
        return (
            <Route router={this.router} pattern={signInPath}>
                <SignInComponent
                    identityClient={this.identityClient}
                    router={this.router}
                />
            </Route>
        );
    }
}
