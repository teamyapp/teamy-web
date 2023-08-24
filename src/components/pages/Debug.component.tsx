import React, { Component, ReactNode } from 'react';

import { Config } from '@core/config/config';

import styles from './Debug.component.module.scss';

interface ConfigRow {
    name: string;
    value?: string;
    link?: string;
}

interface Props {
    repoOwner: string;
    repoName: string;
    config: Config;
}

interface State {
    configRows: ConfigRow[];
}

export class DebugComponent extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            configRows: [],
        };
    }

    public componentDidMount() {
        this.setState({
            configRows: [
                {
                    name: 'Environment',
                    value: this.props.config.environment,
                },
                {
                    name: 'Git commit',
                    value: GIT_SHORT_COMMIT_HASH,
                    link: `https://github.com/${this.props.repoOwner}/${this.props.repoName}/commit/${GIT_LONG_COMMIT_HASH}`,
                },
                {
                    name: 'Teamy Web API Endpoint',
                    value: this.props.config.servicesWebAPIEndpoint,
                },
                {
                    name: 'Teamy WebSocket API Endpoint',
                    value: this.props.config.servicesWebSocketAPIEndpoint,
                },
                {
                    name: 'Identity API Endpoint',
                    value: this.props.config.identityApiBaseEndpoint,
                },
            ],
        });
    }

    public render(): ReactNode {
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
    ): ReactNode => {
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
