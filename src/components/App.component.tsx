import React, {Component, ReactElement} from 'react';
import styles from './App.component.module.scss';
import DrawerComponent from './Drawer.component';
import StatefulExecutionComponent from './modes/Execution/Execution.component';
import MaterialIconComponent from './ui/MaterialIcon.component';

interface IState {
    isDrawerOpen: boolean;
}

export default class AppComponent extends Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isDrawerOpen: false
        };
    }

    public render(): ReactElement {
        return (
            <div className={styles.App}>
                <DrawerComponent isDrawerOpen={this.state.isDrawerOpen} onMenuClose={this.onMenuToggle}/>
                <div className={styles.Content}>
                    <header className={styles.Header}>
                        <div className={styles.MenuButtonPlaceHolder}>
                            {!this.state.isDrawerOpen && (
                                <div className={styles.MenuButton} onClick={this.onMenuToggle}>
                                    <MaterialIconComponent>menu</MaterialIconComponent>
                                </div>
                            )}
                        </div>
                        <div className={styles.TeamName}>
                            Teamy
                        </div>
                    </header>
                    <StatefulExecutionComponent/>
                </div>
            </div>
        );
    };

    onMenuToggle = () => {
        this.setState({
            isDrawerOpen: !this.state.isDrawerOpen
        });
    };
}