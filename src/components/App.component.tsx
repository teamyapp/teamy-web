import styles from './App.component.module.scss';
import DrawerComponent from './Drawer.component';
    
function App() {
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
            StatefulExecutionComponent
        </div>
    );
}

export default App;
