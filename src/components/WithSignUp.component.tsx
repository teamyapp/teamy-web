import React, {
    Component,
    ComponentType,
    ExoticComponent,
    ForwardedRef,
    ReactElement,
    createRef,
    forwardRef,
} from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { TextFieldUI } from '@lib/ui/TextField';

import { signUpPath, signUpRoutePattern } from '@core/config/routing';
import { Deps } from '@core/dep/deps';

import styles from './SignUp.component.module.scss';

interface State {
    isLoaded: boolean;
    isSignedUp: boolean;
}

interface Props {
    forwardedRef: ForwardedRef<any>;
}

export function WithSignUp(
    deps: Deps,
    WrappedComponent: ComponentType<any>,
): ExoticComponent<any> {
    class SignUpComponent extends Component<Props, State> {
        private readonly firstNameTextFieldRef = createRef<TextFieldUI>();
        private readonly lastNameTextFieldRef = createRef<TextFieldUI>();

        private currUri?: string;

        constructor(props: any) {
            super(props);
            this.state = {
                isLoaded: false,
                isSignedUp: false,
            };
        }

        public async componentDidMount() {
            const me = await deps.userService.fetchMe('network-only');
            this.currUri = deps.router.CurrentUri;

            let isSignedUp = true;
            if (!me) {
                isSignedUp = false;
                deps.router.registerRoute(signUpRoutePattern);
                deps.router.navigateTo(signUpPath);
            }

            this.setState({
                isSignedUp: isSignedUp,
                isLoaded: true,
            });
        }

        public render(): ReactElement {
            if (!this.state.isLoaded) {
                return <div />;
            }

            const { forwardedRef, ...rest } = this.props;
            return this.state.isSignedUp ? (
                <WrappedComponent ref={forwardedRef} {...rest} />
            ) : (
                <div className={styles.SignUp}>
                    <div className={styles.Content}>
                        <div className={styles.Title}>Sign Up</div>
                        <div className={styles.UserName}>
                            <div className={styles.Input}>
                                <TextFieldUI
                                    ref={this.firstNameTextFieldRef}
                                    label={'First Name'}
                                />
                            </div>
                            <div className={styles.Input}>
                                <TextFieldUI
                                    ref={this.lastNameTextFieldRef}
                                    label={'Last Name'}
                                />
                            </div>
                        </div>
                        <div className={styles.Actions}>
                            <div className={styles.CreateAccount}>
                                <ButtonUI
                                    label={'Create Account'}
                                    onClick={this.onCreateAccountClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        private onCreateAccountClick = async () => {
            await deps.userService.createUser({
                firstName: this.firstNameTextFieldRef.current?.value || 'New',
                lastName: this.lastNameTextFieldRef.current?.value || 'User',
            });
            if (this.currUri) {
                deps.router.navigateTo(this.currUri);
            }
            this.setState({
                isSignedUp: true,
            });
        };
    }

    return forwardRef<any, Props>((props, ref) => {
        return <SignUpComponent {...props} forwardedRef={ref} />;
    });
}
