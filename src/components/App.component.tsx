import React, {Component, ReactElement} from 'react';
import styles from './App.component.module.scss';
import DrawerComponent from './Drawer.component';
import StatefulExecutionComponent from './modes/Execution/Execution.component';

export default class AppComponent extends Component {
    public render(): ReactElement {
        return (
            <div className={styles.App}>
                {/* TODO: Drawer */}
                <DrawerComponent />
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
}
 

