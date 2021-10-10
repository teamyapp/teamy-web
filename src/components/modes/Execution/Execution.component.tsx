import { History, LocationState } from 'history';
import React, { Component, ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import Task from '../../../entity/Task';
import { AppState } from '../../../store/store';
import TabsComponent from '../../ui/Tabs.component';
import styles from './Execution.component.module.scss';
import PersonalComponent from './Personal.component';

const routes = ['me', 'team'];

interface IProps {
    routerUrl: string;
    routerHistory: History<LocationState>;
    needAttention?: Task;
    upcomingTasks: Task[];
    deliveredTasks: Task[];
}

class ExecutionComponent extends Component<IProps> {
    public render(): ReactElement {
        return (
            <div className={styles.Execution}>
                <div className={styles.Tabs}>
                    <div className={styles.Container}>
                        <TabsComponent
                            tabNames={['Me', 'Team']}
                            onTabClick={this.onTabClick}
                        />
                    </div>
                </div>
                <div className={styles.Content}>
                    <Switch>
                        <Route path={`${this.props.routerUrl}me`}>
                            <PersonalComponent
                                taskNeedAttention={this.props.needAttention}
                                upcomingTasks={this.props.upcomingTasks}
                                deliveredTasks={this.props.deliveredTasks}
                            />
                        </Route>
                    </Switch>
                </div>
            </div>
        );
    }

    private onTabClick = (index: number) => {
        this.props.routerHistory.push(routes[index]);
    };
}

export default function StatefulExecutionComponent() {
    const { url } = useRouteMatch();
    const history = useHistory();
    const { needAttention, upcomingTasks, deliveredTasks } = useSelector(
        (state: AppState) => state.executionPersonal,
    );
    return (
        <ExecutionComponent
            routerUrl={url}
            routerHistory={history}
            needAttention={needAttention}
            upcomingTasks={upcomingTasks}
            deliveredTasks={deliveredTasks}
        />
    );
}
