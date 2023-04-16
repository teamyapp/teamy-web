import React, {Component } from 'react';

import styles from './Banner.module.scss';
import { MaterialIconUI } from './MaterialIcon';

interface Props {
    closable?: boolean;
    content: React.ReactNode;
}

interface State {
    closed: boolean;
}

export class BannerUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            closed: false,
        };
    }

    render() {
        if (this.state.closed) {
            return null;
        }

        return (
            <div className={styles.Banner}>
                {this.props.content}
                {this.props.closable && (
                    <div className={styles.Close} onClick={this.handleClose}>
                        <MaterialIconUI>close</MaterialIconUI>
                    </div>
                )}
            </div>
        );
    }

    private handleClose = () => {
        this.setState({ closed: true });
    };
}
