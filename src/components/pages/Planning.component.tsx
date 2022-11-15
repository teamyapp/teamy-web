import { Component, createRef } from 'react';

import { Editor } from '@lib/editor/Editor';

import styles from './Planning.component.module.scss';

export class PlanningComponent extends Component {
    private editor = new Editor();
    private planningEl = createRef<any>();

    render() {
        return <div ref={this.planningEl} className={styles.Planning}></div>;
    }

    componentDidMount() {
        this.editor.render(this.planningEl.current);
    }

    componentWillUnmount() {
        this.editor.dispose();
    }
}
