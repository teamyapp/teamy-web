import React, { Component } from 'react';

import { ButtonUI } from '@lib/ui/Button';

import { Deps } from '@core/dep/deps';
import { Invitation } from '@core/entity/invitation';
import { InvitationStatus } from '@core/entity/invitationStatus';
import { User } from '@core/entity/user';
import {
    getInvitationCode,
    getInvitationId,
    rootRoutePattern,
} from '@core/routing/routes';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './Invitation.component.module.scss';

interface Props {
    deps: Deps;
}

interface State {
    me?: User;
    hasError: boolean;
    invitation?: Invitation;
}

export class InvitationComponent extends Component<Props, State> {
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            hasError: false,
        };
    }

    public async componentDidMount() {
        const id = getInvitationId(
            this.props.deps.router.currentRouteUpdate.params,
        );
        const code = getInvitationCode(
            this.props.deps.router.currentRouteUpdate.params,
        );

        if (!code || !id) {
            this.setState({
                hasError: true,
            });
            return;
        }

        const invitationId = parseInt(id);
        await this.stateSyncer.pullInvitationWithCode(invitationId, code);
        const invitation = await this.graphSource.invitation(invitationId);
        if (!invitation) {
            this.setState({
                hasError: true,
            });
            return;
        }

        if (invitation.status !== 'PENDING') {
            this.setState({
                hasError: true,
            });
            return;
        }

        await this.stateSyncer.pullCurrentUser();
        const currentUser = this.graphSource.currentUser();
        this.setState({
            me: currentUser,
            invitation,
        });
    }

    public render() {
        return (
            <div className={styles.Invitation}>
                <div className={styles.Content}>
                    {this.state.hasError ? (
                        <>
                            <div className={styles.Error}>
                                {this.state.invitation
                                    ? renderInvitationStateError(
                                          this.state.invitation.status,
                                      )
                                    : 'Invitation not found'}
                                .
                            </div>
                            <div>
                                <ButtonUI
                                    label={'Go to Homepage'}
                                    onClick={this.onGoHomePageClick}
                                />
                            </div>
                        </>
                    ) : (
                        this.state.invitation && (
                            <>
                                <div className={styles.Intro}>
                                    <div>
                                        <div className={styles.Greeting}>
                                            Hi{' '}
                                            <span className={styles.MyName}>
                                                {this.state.me?.firstName}
                                            </span>
                                            ,
                                        </div>
                                        <span className={styles.SenderName}>
                                            {
                                                this.state.invitation?.sender
                                                    .firstName
                                            }
                                            &nbsp;
                                            {
                                                this.state.invitation?.sender
                                                    .lastName
                                            }
                                        </span>
                                        invited you to join
                                    </div>
                                    <div className={styles.Team}>
                                        {this.state.invitation?.joiningTeam
                                            .iconUrl ? (
                                            <img
                                                className={styles.TeamIcon}
                                                alt={
                                                    this.state.invitation
                                                        ?.joiningTeam.name
                                                }
                                                src={
                                                    this.state.invitation
                                                        ?.joiningTeam.iconUrl
                                                }
                                            />
                                        ) : (
                                            <div
                                                className={
                                                    styles.DefaultTeamIcon
                                                }
                                            >
                                                {this.state.invitation
                                                    ?.joiningTeam.name
                                                    ? this.state.invitation?.joiningTeam.name[0].toUpperCase()
                                                    : '?'}
                                            </div>
                                        )}
                                        <div className={styles.TeamName}>
                                            {
                                                this.state.invitation
                                                    ?.joiningTeam.name
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.Actions}>
                                    <div
                                        className={`${styles.Action} ${styles.Accept}`}
                                    >
                                        <ButtonUI
                                            label={'Accept'}
                                            onClick={this.onAcceptClick}
                                        />
                                    </div>
                                    <div
                                        className={`${styles.Action} ${styles.Decline}`}
                                    >
                                        <ButtonUI
                                            label={'Decline'}
                                            onClick={this.onDeclineClick}
                                        />
                                    </div>
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>
        );
    }

    private onAcceptClick = async () => {
        await this.stateSyncer.acceptInvitation(
            this.state.invitation?.id!,
            this.state.invitation?.code!,
        );
        const teamId = this.state.invitation?.joiningTeam?.id!;
        this.stateSyncer.trySetCurrentTeam(teamId);
        this.onGoHomePageClick();
    };

    private onDeclineClick = async () => {
        await this.stateSyncer.declineInvitation(
            this.state.invitation?.id!,
            this.state.invitation?.code!,
        );
        this.onGoHomePageClick();
    };

    private onGoHomePageClick = () => {
        this.props.deps.router.navigateTo(rootRoutePattern);
    };
}

function renderInvitationStateError(status: InvitationStatus) {
    switch (status) {
        case 'ACCEPTED':
            return 'Invitation has been accepted already';
        case 'DECLINED':
            return 'Invitation has been declined already';
        case 'EXPIRED':
            return 'Invitation is expired';
    }
}
