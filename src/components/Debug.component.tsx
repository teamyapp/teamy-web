import _ from 'lodash';
import React, { Component, ReactElement } from 'react';

import { getConfig as getIdentityConfig } from '@lib/identity/config';

import { getConfig } from '@core/config/config';
import { getEnvVar, getEnvironment } from '@core/env/environment';

import styles from './Debug.component.module.scss';

interface ConfigRow {
    name: string;
    value?: string;
    link?: string;
}

interface IProps {
    repoOwner: string;
    repoName: string;
}

interface IState {
    configRows: ConfigRow[];
}

export class DebugComponent extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            configRows: [],
        };
    }

    public componentDidMount() {
        const env = getEnvironment();
        // @ts-ignore
        this.setState({
            configRows: [
                {
                    name: 'Environment',
                    value: _.capitalize(env),
                },
                {
                    name: 'Git commit',
                    value: GIT_SHORT_COMMIT_HASH,
                    link: `https://github.com/${this.props.repoOwner}/${this.props.repoName}/commit/${GIT_LONG_COMMIT_HASH}`,
                },
                {
                    name: 'Teamy GraphQL API',
                    value: getConfig(env).teamyGraphQLEndpoint,
                },
                {
                    name: 'Identity web API',
                    value: getIdentityConfig(env).apiBaseEndpoint,
                },
            ],
        });
    }

    public render(): ReactElement {
        return (
            <div className={styles.Debug}>
                <div className={`${styles.Card} ${styles.InfoCard}`}>
                    <div className={styles.Title}>Debug</div>
                    <table>
                        <tbody>
                            {this.state.configRows.map(this.renderConfigRow)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    private renderConfigRow = (
        configRow: ConfigRow,
        index: number,
    ): ReactElement => {
        return (
            <tr key={index}>
                <td className={styles.RowName}>{configRow.name}</td>
                <td>
                    {configRow.link ? (
                        <a
                            href={configRow.link}
                            rel='noreferrer noopener'
                            target={'_blank'}
                        >
                            {configRow.value}
                        </a>
                    ) : (
                        configRow.value
                    )}
                </td>
            </tr>
        );
    };
}
