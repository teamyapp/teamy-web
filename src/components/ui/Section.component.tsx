import {Children, Component, ReactElement} from 'react';

import styles from './Section.component.module.scss';

interface IProps {
    title: string;
}

export default class SectionComponent extends Component<IProps> {
    public render(): ReactElement {
        return (
            <section className={styles.Section}>
                <div className={styles.Title}>
                    {this.props.title}
                </div>
                {
                    Children.count(this.props.children) > 0 && (
                        <div>
                            {this.props.children}
                        </div>
                    )
                }
            </section>);
    };
}