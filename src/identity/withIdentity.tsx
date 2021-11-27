import {
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
                isSignedIn: false,
            };
        }

        public async componentDidMount() {
            this.setState({
                isSignedIn: await identityClient.isSignedIn(),
            });
        }

        public render(): ReactElement {
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
