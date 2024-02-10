import classNames from 'classnames';
import { Component } from 'react';

import styles from './Toggle.module.scss';

interface Props {
    defaultEnable: boolean;
    onStatusChange?: (status: boolean) => void;
}

interface State {
    status: boolean;
}

export class ToggleUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            status: props.defaultEnable,
        };
    }

    get status(): boolean {
        return this.state.status;
    }

    setStatus(status: boolean) {
        this.setState({
            status,
        });
    }

    render() {
        return (
            <div
                className={`${styles.Toggle} ${classNames({
                    [styles.Enabled]: this.state.status,
                })}`}
                onClick={this.onToggleClick}
            >
                <div className={styles.Button} />
            </div>
        );
    }

    onToggleClick = () => {
        this.setState({
            status: !this.state.status,
        });
        this.props.onStatusChange?.(!this.state.status);
    };
}
