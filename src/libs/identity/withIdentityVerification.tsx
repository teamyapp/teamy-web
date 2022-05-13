import React, {
    Component,
    ComponentType,
    ExoticComponent,
    ForwardedRef,
    ReactNode,
    forwardRef,
} from 'react';

import { signInPath } from '@core/config/routing';

import { Router } from '../router/router';
import { IdentityClient } from './Identity.client';

interface State {
    isLoaded: boolean;
    isSignedIn: boolean;
}

interface Props {
    forwardedRef: ForwardedRef<any>;
}

export function WithIdentityVerification(
    identityClient: IdentityClient,
    router: Router,
    WrappedComponent: ComponentType<any>,
): ExoticComponent<any> {
    class IdentityComponent extends Component<Props, State> {
        public async componentDidMount() {
            if (router.CurrentUri?.startsWith(signInPath)) {
                return;
            }

            const isSignedIn = await identityClient.isSignedIn();
            if (!isSignedIn) {
                const currUrl = window.location.href;
                identityClient.saveSignInRedirectUrl(currUrl);
                router.navigateTo(signInPath);
            }
        }

        public render(): ReactNode {
            const { forwardedRef, ...rest } = this.props;
            return <WrappedComponent ref={forwardedRef} {...rest} />;
        }
    }

    return forwardRef<any, Props>((props, ref) => {
        return <IdentityComponent {...props} forwardedRef={ref} />;
    });
}
