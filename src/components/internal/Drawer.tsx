import classNames from 'classnames';
import React, { Component, MouseEvent, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { orderByName } from '@core/data/team.order';
import { Team } from '@core/entity/team';

import { ContextMenuComponent } from './ContextMenu.component';
import styles from './Drawer.module.scss';
import { RelativeLayout } from '@lib/layout';

interface Props {
    teams: Team[];
    activeTeamId?: number;
    onMenuClose?: () => void;
    onActiveTeamSelect?: (teamId: number) => void;
    isDrawerOpen: boolean;
    onAddTeamMembersClick?: (teamId: number) => void;
    onShowTeamMembersClick?: (teamId: number) => void;
    onShowInvitationsClick?: (teamId: number) => void;
    onViewTeamSettingsClick?: (teamId: number) => void;
    onCreateTeamClick?: () => void;
    relativeLayout: RelativeLayout;
}

export class DrawerUI extends Component<Props> {
    private readonly teamContextMenuRef = createRef<ContextMenuComponent>();
    private selectedTeamId?: number;

    render = () => {
        return (
            <div
                className={`${styles.Drawer} ${classNames({
                    [styles.Show]: this.props.isDrawerOpen,
                })}`}
            >
                <div className={styles.Header}>
                    <div className={styles.MenuButtonPlaceHolder}>
                        {this.props.isDrawerOpen && (
                            <div
                                className={styles.MenuButton}
                                onClick={this.onMenuToggle}
                            >
                                <MaterialIconUI>menu_open</MaterialIconUI>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.Teams}>
                    {[...this.props.teams]
                        .sort(orderByName)
                        .map(this.renderTeam)}
                    <div className={styles.CreateTeamFrame}>
                        <TooltipUI message={'Create Team'} verticalAlignment={'center'} horizontalAlignment={'right'} relativeLayout={this.props.relativeLayout}>
                            <div
                                className={styles.CreateTeamButton}
                                onClick={this.props.onCreateTeamClick}
                            >
                                <MaterialIconUI>add</MaterialIconUI>
                            </div>
                        </TooltipUI>
                    </div>
                </div>
                <ContextMenuComponent
                    ref={this.teamContextMenuRef}
                    menuItems={[
                        {
                            key: 'addMembers',
                            action: this.onAddMembersClick,
                            label: 'Add Members',
                        },
                        {
                            key: 'showMembers',
                            action: this.onShowMembersClick,
                            label: 'Show Members',
                        },
                        {
                            key: 'showInvitations',
                            action: this.onShowInvitationsClick,
                            label: 'Show Invitations',
                        },
                        {
                            key: 'viewTeamSettings',
                            action: this.onViewTeamSettingsClick,
                            label: 'View Team Settings',
                        },
                    ]}
                />
            </div>
        );
    };

    private renderTeam = (team: Team, index: number) => {
        return (
            <div
                className={`${styles.IconFrameBorder} ${classNames({
                    [styles.Active]: this.props.activeTeamId === team.id,
                })}`}
                key={team.id}
            >
                <TooltipUI message={team.name} verticalAlignment={'center'} horizontalAlignment={'right'} relativeLayout={this.props.relativeLayout}>
                    <div
                        className={styles.IconFrame}
                        onClick={this.onTeamClick(team.id)}
                        onContextMenu={this.onTeamContextMenu(team.id)}
                    >
                        {team.iconUrl ? (
                            <img
                                className={styles.Icon}
                                src={team.iconUrl}
                                alt={team.name}
                            />
                        ) : (
                            <div className={styles.IconDefault}>
                                {team.name[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                </TooltipUI>
            </div>
        );
    };

    private onMenuToggle = () => {
        this.props.onMenuClose?.call(null);
    };

    private onTeamClick = (teamId: number): (() => void) => {
        return () => {
            this.props.onActiveTeamSelect?.call(null, teamId);
        };
    };

    private onTeamContextMenu = (
        teamId: number,
    ): ((event: React.MouseEvent<HTMLElement>) => void) => {
        return (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            this.selectedTeamId = teamId;
            this.teamContextMenuRef.current?.open(event.clientY, event.clientX);
        };
    };

    private onAddMembersClick = () => {
        if (this.selectedTeamId) {
            this.props.onAddTeamMembersClick?.call(null, this.selectedTeamId);
        }
    };

    private onShowMembersClick = () => {
        if (this.selectedTeamId) {
            this.props.onShowTeamMembersClick?.call(null, this.selectedTeamId);
        }
    };

    private onShowInvitationsClick = () => {
        if (this.selectedTeamId) {
            this.props.onShowInvitationsClick?.call(null, this.selectedTeamId);
        }
    };

    private onViewTeamSettingsClick = () => {
        if (this.selectedTeamId) {
            this.props.onViewTeamSettingsClick?.call(null, this.selectedTeamId);
        }
    };
}
