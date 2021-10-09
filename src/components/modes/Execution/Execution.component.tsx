import React, { Component, ReactElement } from 'react';
import styles from './Execution.component.module.scss';


class ExecutionComponent extends Component {
    public render(): ReactElement {
        return (
            <div className={styles.Execution}>
                {/* TODO: tabs detail */}
                <div className={styles.Tabs}>
                    <div className={styles.Container}>
                        {/* TODO: tabs component */}
                    </div>
                </div>
                {/* TODO: content detail */}
                <div className={styles.Content}>
                    {/* TODO: Route and MeComponent */}
                </div>
            </div>
        );
    }
}

export default function StatefulExecutionComponent() {
    return <ExecutionComponent />;
}
