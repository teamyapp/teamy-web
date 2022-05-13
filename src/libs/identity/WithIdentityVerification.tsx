import React, {
    Component,
    ComponentType,
    ExoticComponent,
    ForwardedRef,
    ReactNode,
    forwardRef,
} from 'react';

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
    signInRoutePattern: string,
    signInFinishRoutePattern: string,
    WrappedComponent: ComponentType<any>,
): ExoticComponent<any> {
    const skippedRoutes = [signInRoutePattern, signInFinishRoutePattern];
    class EmbeddedComponent extends Component<Props, State> {
        public async componentDidMount() {
            if (skippedRoutes.includes(router.currentRouteUpdate.routePattern)) {
                return;
            }

            const isSignedIn = await identityClient.isSignedIn();
            if (!isSignedIn) {
                const currUrl = window.location.href;
                identityClient.saveSignInRedirectUrl(currUrl);
                router.registerRoute(signInRoutePattern);
                router.navigateTo(signInRoutePattern);
            }
        }

        public render(): ReactNode {
            const { forwardedRef, ...rest } = this.props;
            return <WrappedComponent ref={forwardedRef} {...rest} />;
        }
    }

    return forwardRef<any, Props>((props, ref) => {
        return <EmbeddedComponent {...props} forwardedRef={ref} />;
    });
}
