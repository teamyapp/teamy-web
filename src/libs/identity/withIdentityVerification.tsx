import React, {
    Component,
    ComponentType,
    ExoticComponent,
    ForwardedRef,
    ReactElement,
    forwardRef,
} from 'react';

import { Router } from '../router/router';
import { IdentityClient } from './Identity.client';
import { SignInComponent } from './SignIn.component';

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
    signInUri: string,
    WrappedComponent: ComponentType<any>,
): ExoticComponent<any> {
    class IdentityComponent extends Component<Props, State> {
        private currUri?: string;

        constructor(props: any) {
            super(props);
            this.state = {
                isLoaded: false,
                isSignedIn: false,
            };
        }

        public async componentDidMount() {
            const isSignedIn = await identityClient.isSignedIn();
            this.currUri = router.CurrentUri;
            if (!isSignedIn) {
                router.navigateTo(signInUri);
            }

            this.setState({
                isSignedIn: isSignedIn,
                isLoaded: true,
            });
        }

        public render(): ReactElement {
            if (!this.state.isLoaded) {
                return <div />;
            }

            const { forwardedRef, ...rest } = this.props;
            return this.state.isSignedIn ? (
                <WrappedComponent ref={forwardedRef} {...rest} />
            ) : (
                <SignInComponent
                    identityClient={identityClient}
                    onSignInSucceed={this.onSignInSucceed}
                />
            );
        }

        private onSignInSucceed = () => {
            if (this.currUri) {
                router.navigateTo(this.currUri);
            }

            this.setState({
                isSignedIn: true,
            });
        };
    }

    return forwardRef<any, Props>((props, ref) => {
        return <IdentityComponent {...props} forwardedRef={ref} />;
    });
}
