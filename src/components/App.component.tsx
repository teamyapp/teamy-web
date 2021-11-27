import React, { Component, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Deps } from '../deps';
import { withIdentity } from '../identity/withIdentity';
import store from '../store/store';
import styles from './App.component.module.scss';
import DrawerComponent from './Drawer.component';
import ExecutionComponentHook from './modes/Execution/Execution.component';
import MaterialIconComponent from './ui/MaterialIcon.component';

interface IProps {
    deps: Deps;
}

interface IState {
    isDrawerOpen: boolean;
}

export class AppComponent extends Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isDrawerOpen: false,
        };
    }

    public render() {
        return (
            <div className={styles.App}>
                <DrawerComponent
                    isDrawerOpen={this.state.isDrawerOpen}
                    onMenuClose={this.onMenuToggle}
                />
                <div className={styles.Content}>
                    <header className={styles.Header}>
                        <div className={styles.MenuButtonPlaceHolder}>
                            {!this.state.isDrawerOpen && (
                                <div
                                    className={styles.MenuButton}
                                    onClick={this.onMenuToggle}
                                >
                                    <MaterialIconComponent>
                                        menu
                                    </MaterialIconComponent>
                                </div>
                            )}
                        </div>
                        <div className={styles.TeamName}>Teamy</div>
                    </header>
                    <div className={styles.Execution}>
                        {
                            <ExecutionComponentHook
                                taskService={this.props.deps.taskService}
                                executionModeService={
                                    this.props.deps.executionModeService
                                }
                            />
                        }
                    </div>
                </div>
            </div>
        );
    }

    onMenuToggle = () => {
        this.setState({
            isDrawerOpen: !this.state.isDrawerOpen,
        });
    };
}

export default function AppComponentHook(props: IProps): ReactElement {
    const AppWithIdentity = withIdentity(
        props.deps.identityClient,
        AppComponent,
    );
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppWithIdentity deps={props.deps} />
            </BrowserRouter>
        </Provider>
    );
}
