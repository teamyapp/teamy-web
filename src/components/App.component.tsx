import styles from './App.component.module.scss';
import StatefulExecutionComponent from './modes/Execution/Execution.component';

function App() {
    return (
        <div className={styles.App}>
            {/* TODO: Drawer */}
            Drawer&nbsp;
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

export default App;
