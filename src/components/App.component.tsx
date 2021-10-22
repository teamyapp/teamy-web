import React, { Component, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ExecutionModeService } from '../service/ExecutionMode.service';
import store from '../store/store';
import styles from './App.component.module.scss';
import DrawerComponent from './Drawer.component';
import ExecutionComponentHook from './modes/Execution/Execution.component';
import MaterialIconComponent from './ui/MaterialIcon.component';

interface IProps {
    executionModeService: ExecutionModeService;
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

    public render(): ReactElement {
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
                                executionModeService={
                                    this.props.executionModeService
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

export default function AppComponentContainer(props: IProps): ReactElement {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <AppComponent
                    executionModeService={props.executionModeService}
                />
            </BrowserRouter>
        </Provider>
    );
}
