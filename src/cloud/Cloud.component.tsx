import { PopChannel } from '@lib/csp/csp';
import React, { Component, Fragment, ReactNode } from 'react';

import {
    IdentityClient,
    accessTokenParam,
} from '@lib/identity/Identity.client';
import { Route } from '@lib/router/Route';
import { Router, RouteUpdate } from '@lib/router/router';

import { signInFinishRoutePattern, signInRoutePattern } from '@core/config/routing';
import { Deps } from '@core/dep/deps';

import { SignInComponent } from './identity/SignIn.component';

interface Props {
    deps: Deps;
}

export class CloudComponent extends Component<Props> {
    private readonly router: Router;
    private readonly identityClient: IdentityClient;
    private  routeChangeCh?: PopChannel<RouteUpdate | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = this.props.deps.router;
        this.identityClient = this.props.deps.identityClient;
    }

    public async componentDidMount() {
        this.router.registerRoute(signInFinishRoutePattern);
        this.routeChangeCh = this.router.subscribeRouteChange();

        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeCh?.pop();
                if (routeUpdate === undefined) {
                    return
                }

                if (routeUpdate?.routePattern === signInFinishRoutePattern) {
                    console.log('+++++++')
                    this.identityClient.finishSignIn(
                        routeUpdate.params.queryParams[accessTokenParam],
                    );
                }
            }
        })().then();
    }

    public componentWillUnmount() {
        this.routeChangeCh?.close();
    }

    public render(): ReactNode {
        return (
            <Fragment>
                <Route router={this.router} pattern={signInRoutePattern}>
                    <SignInComponent
                        identityClient={this.identityClient}
                        router={this.router}
                    />
                </Route>
            </Fragment>
        );
    }
}
