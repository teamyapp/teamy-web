import React, { ChangeEvent, Component } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { taskGoalLengthLimit } from '@core/config/config';
import { CreateTaskInput } from '@core/entity/input';
import { User } from '@core/entity/user';

import styles from './InlineCreateTask.module.scss';
import { UserProfileUI } from './UserProfile';

interface Props {
    owner?: User;
    onCreateTask?: (task: CreateTaskInput) => void;
    onDiscardCreatingTask?: () => void;
}

interface State {
    task: CreateTaskInput;
}

export class InlineCreateTask extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            task: {
                goal: '',
                ownerUserId: props.owner?.id,
            },
        };
    }

    public render() {
        return (
            <div className={styles.Task}>
                <div className={styles.LeftSection}>
                    <textarea
                        autoFocus
                        maxLength={taskGoalLengthLimit}
                        className={styles.GoalTextField}
                        value={this.state.task.goal || ''}
                        onChange={this.onGoalChange}
                        onBlur={this.onGoalBlur}
                    />
                </div>
                <div className={styles.Owner}>
                    <div className={`${styles.Action} ${styles.OwnerIcon}`}>
                        {this.props.owner ? (
                            <UserProfileUI user={this.props.owner} />
                        ) : (
                            <MaterialIconUI>face</MaterialIconUI>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    private onGoalChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            task: Object.assign({}, this.state.task, {
                goal: event.target.value,
            }),
        });
    };

    private onGoalBlur = () => {
        if (this.state.task.goal) {
            this.props.onCreateTask?.call(null, this.state.task);
        } else {
            this.props.onDiscardCreatingTask?.call(null);
        }
    };
}
