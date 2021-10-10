import React, { Component, ReactElement } from 'react';
import styles from './App.component.module.scss';
import DrawerComponent from './Drawer.component';
import StatefulExecutionComponent from './modes/Execution/Execution.component';

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
                {/* TODO: Use drawer in the AppComponent */}
                 <DrawerComponent isDrawerOpen={this.state.isDrawerOpen} onMenuClose={this.onMenuToggle}/>
                {/* TODO: Header Detail */}
                <div className={styles.Content}>
                    <header className={styles.Header}>
                        <div className={styles.TeamName}>Teamy</div>
                    </header>
                </div>
                {/* TODO: StatefulExecutionComponent */}
                <StatefulExecutionComponent />
            </div>
        );
    }

    onMenuToggle = () => {
        this.setState({
            isDrawerOpen: !this.state.isDrawerOpen
        });
    };
}
