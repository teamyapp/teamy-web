import { Component, ReactElement } from 'react';
import styles from './NamedValue.component.module.scss';

interface IProps {
    name: string;
    value: string;
}

export default class NamedValueComponent extends Component<IProps> {
    public render(): ReactElement {
        return (
            <div className={styles.NamedValue}>
                <div className={styles.Name}>{this.props.name}</div>
                <div className={styles.Value}>{this.props.value}</div>
            </div>
        );
    }
}
