import React, { Component, Fragment } from 'react';

import { ButtonUI } from '@lib/ui/Button';

import { getInvitationCode, rootRoutePattern } from '@core/config/routing';
import { Deps } from '@core/dep/deps';
import { Invitation } from '@core/entity/invitation';
import { InvitationStatus } from '@core/entity/invitationStatus';
import { User } from '@core/entity/user';

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
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
        };
    }

    public async componentDidMount() {
        const code = getInvitationCode(
            this.props.deps.router.currentRouteUpdate.params,
        );
        if (!code) {
            this.setState({
                hasError: true,
            });
            return;
        }

        const invitation =
            await this.props.deps.invitationService.findInvitationByCode(
                code || '',
            );
        if (!invitation) {
            this.setState({
                hasError: true,
            });
            return;
        }
        if (invitation.status !== 'PENDING') {
            this.setState({
                invitation,
                hasError: true,
            });
            return;
        }

        this.setState({
            me: this.props.deps.localStore.getState().currentUser,
            invitation,
        });
    }

    public render() {
        return (
            <div className={styles.Invitation}>
                <div className={styles.Content}>
                    {this.state.hasError ? (
                        <Fragment>
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
                        </Fragment>
                    ) : (
                        <Fragment>
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
                                        {this.state.invitation?.sender.lastName}
                                    </span>
                                    invited you to join
                                </div>
                                <div className={styles.Team}>
                                    <img
                                        className={styles.TeamIcon}
                                        alt={this.state.invitation?.team.name}
                                        src={
                                            this.state.invitation?.team.iconUrl
                                        }
                                    />
                                    <div className={styles.TeamName}>
                                        {this.state.invitation?.team.name}
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
                        </Fragment>
                    )}
                </div>
            </div>
        );
    }

    private onAcceptClick = async () => {
        const code = getInvitationCode(
            this.props.deps.router.currentRouteUpdate.params,
        );

        // TODO: replace with mutation event
        await this.props.deps.invitationService.acceptInvitation(code!);

        const teamId = this.state.invitation?.team?.id!;
        await this.props.deps.localStore.mutate({
            type: 'UpdateActiveTeam',
            teamId: teamId,
        });
        this.onGoHomePageClick();
    };

    private onDeclineClick = async () => {
        const code = getInvitationCode(
            this.props.deps.router.currentRouteUpdate.params,
        );

        // TODO: replace with mutation event
        await this.props.deps.invitationService.declineInvitation(code!);
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
