import _ from 'lodash';
import React, { Component, ReactElement } from 'react';
import { getConfig } from '../config/config';
import { getEnvironment, getEnvVar } from '../env/environment';
import { getConfig as getIdentityConfig } from '../identity/config';

import styles from './Dev.component.module.scss';

interface IConfigRow {
    name: string;
    value?: string;
    link?: string;
}

interface IFileStats {
    path: string;
    stats: ICodeSummary;
    badFile: boolean;
}

interface ICodeSummary {
    total: number;
    source: number;
    comment: number;
    single: number;
    block: number;
    mixed: number;
    empty: number;
    todo: number;
    blockEmpty: number;
}

interface ICodeStats {
    files: IFileStats[];
    summary: ICodeSummary;
}

interface IProps {
    repoOwner: string;
    repoName: string;
}

interface IState {
    configRows: IConfigRow[];
    codeStats?: ICodeStats;
}

export class DevComponent extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            configRows: [],
        };
    }

    public componentDidMount() {
        const env = getEnvironment();
        const configRows = [
            {
                name: 'Environment',
                value: _.capitalize(env),
            },
            {
                name: 'Git commit',
                value: getEnvVar('GIT_SHORT_COMMIT_HASH'),
                link: `https://github.com/${this.props.repoOwner}/${
                    this.props.repoName
                }/commit/${getEnvVar('GIT_LONG_COMMIT_HASH')}`,
            },
            {
                name: 'Teamy GraphQL API',
                value: getConfig(env).teamyGraphQLEndpoint,
            },
            {
                name: 'Identity web API',
                value: getIdentityConfig(env).apiBaseEndpoint,
            },
        ];

        const codeStats = JSON.parse(getEnvVar('CODE_STATS'));
        this.setState({
            configRows,
            codeStats,
        });
    }

    public render(): ReactElement {
        return (
            <div className={styles.Dev}>
                <div className={`${styles.Card} ${styles.InfoCard}`}>
                    <div className={styles.Section}>
                        <div className={styles.Title}>Debug</div>
                        <table>
                            <tbody>
                                {this.state.configRows.map(
                                    this.renderConfigRow,
                                )}
                            </tbody>
                        </table>
                    </div>
                    {this.state.codeStats && (
                        <div className={styles.Section}>
                            <div className={styles.Title}>Code Status</div>
                            <table>
                                {this.renderCodeSummary(
                                    this.state.codeStats.summary,
                                )}
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private renderConfigRow = (
        configRow: IConfigRow,
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

    private renderCodeSummary = (summary: ICodeSummary): ReactElement => {
        return (
            <tbody>
                <tr>
                    <td className={styles.RowName}>Total Lines</td>
                    <td>{summary.total}</td>
                </tr>
                <tr>
                    <td className={styles.RowName}>Source Code Lines</td>
                    <td>{summary.source}</td>
                </tr>
                <tr>
                    <td className={styles.RowName}>TODOs</td>
                    <td>{summary.todo}</td>
                </tr>
            </tbody>
        );
    };
}
