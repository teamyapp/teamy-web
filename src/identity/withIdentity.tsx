import React, {
    Component,
    ComponentType,
    ExoticComponent,
    ForwardedRef,
    forwardRef,
    ReactElement,
} from 'react';
import { IdentityClient } from './Identity.client';
import { SignInComponent } from './SignIn.component';

interface IState {
    isLoaded: boolean;
    isSignedIn: boolean;
}

interface IProps {
    forwardedRef: ForwardedRef<any>;
}

export function withIdentity(
    identityClient: IdentityClient,
    WrappedComponent: ComponentType<any>,
): ExoticComponent<any> {
    class IdentityComponent extends Component<IProps, IState> {
        constructor(props: any) {
            super(props);
            this.state = {
                isLoaded: false,
                isSignedIn: false,
            };
        }

        public async componentDidMount() {
            const isSignedIn = await identityClient.isSignedIn();
            this.setState({
                isSignedIn: isSignedIn,
                isLoaded: true,
            });
        }

        public render(): ReactElement {
            if (!this.state.isLoaded) {
                return <div></div>;
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
            this.setState({
                isSignedIn: true,
            });
        };
    }

    return forwardRef<any, IProps>((props, ref) => {
        return <IdentityComponent {...props} forwardedRef={ref} />;
    });
}
