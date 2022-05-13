import React, {
    Component,
    ComponentType,
    ExoticComponent,
    ForwardedRef,
    ReactNode,
    forwardRef,
} from 'react';

import {signUpRoutePattern } from '@core/config/routing';
import { Deps } from '@core/dep/deps';

export const signUpRedirectKey = 'signUpRedirect';

interface Props {
    forwardedRef: ForwardedRef<any>;
}

export function WithSignUp(
    deps: Deps,
    WrappedComponent: ComponentType<any>,
): ExoticComponent<any> {
    class EmbeddedComponent extends Component<Props> {
        public async componentDidMount() {
            if (deps.router.currentRouteUpdate.routePattern === signUpRoutePattern) {
                return;
            }

            const me = await deps.userService.fetchMe('network-only');
            if (!me) {
                const currUrl = window.location.href;
                localStorage.setItem(signUpRedirectKey, currUrl);
                deps.router.registerRoute(signUpRoutePattern);
                deps.router.navigateTo(signUpRoutePattern);
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
