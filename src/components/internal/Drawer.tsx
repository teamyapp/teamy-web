import classNames from 'classnames';
import React, { Component, MouseEvent, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { Team } from '@core/entity/team';

import styles from './Drawer.module.scss';

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
}

interface State {
    showTeamContextMenu: boolean;
    teamContextMenuLeft: number;
    teamContextMenuTop: number;
}

export class DrawerUI extends Component<Props, State> {
    private selectedTeamId?: number;
    private teamContextMenuRef: RefObject<any> = createRef();

    constructor(props: Props) {
        super(props);
        this.state = {
            showTeamContextMenu: false,
            teamContextMenuLeft: -1000,
            teamContextMenuTop: -1000,
        };
    }

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
                    {this.props.teams.map(this.renderTeam)}
                    <div className={styles.CreateTeamFrame}>
                        <TooltipUI message={'Create Team'} position={'Right'}>
                            <div
                                className={styles.CreateTeamButton}
                                onClick={this.props.onCreateTeamClick}
                            >
                                <MaterialIconUI>add</MaterialIconUI>
                            </div>
                        </TooltipUI>
                    </div>
                </div>
                {this.state.showTeamContextMenu && (
                    <ul
                        ref={this.teamContextMenuRef}
                        className={styles.TeamContextMenu}
                        tabIndex={-1}
                        style={{
                            left: this.state.teamContextMenuLeft,
                            top: this.state.teamContextMenuTop,
                        }}
                        onBlur={this.onTeamContextMenuBlur}
                    >
                        <li
                            className={styles.ContextMenuItem}
                            onClick={this.onAddMembersClick}
                        >
                            Add members
                        </li>
                        <li
                            className={styles.ContextMenuItem}
                            onClick={this.onShowMembersClick}
                        >
                            Show members
                        </li>
                        <li
                            className={styles.ContextMenuItem}
                            onClick={this.onShowInvitationsClick}
                        >
                            Show invitations
                        </li>
                        <li
                            className={styles.ContextMenuItem}
                            onClick={this.onViewTeamSettingsClick}
                        >
                            Settings
                        </li>
                    </ul>
                )}
            </div>
        );
    };

    private renderTeam = (team: Team, index: number) => {
        return (
            <div
                className={`${styles.IconFrameBorder} ${classNames({
                    [styles.Active]: this.props.activeTeamId === team.id,
                })}`}
                key={index}
            >
                <TooltipUI message={team.name} position={'Right'}>
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
    ): ((event: MouseEvent<HTMLElement>) => void) => {
        return (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            this.showTeamContextMenu(teamId, event.clientX, event.clientY);
        };
    };

    private showTeamContextMenu(teamId: number, left: number, top: number) {
        this.selectedTeamId = teamId;
        this.setState({
            showTeamContextMenu: true,
            teamContextMenuLeft: left,
            teamContextMenuTop: top,
        });
        setTimeout(() => {
            this.teamContextMenuRef.current?.focus();
        });
    }

    private onTeamContextMenuBlur = () => {
        this.closeTeamContextMenu();
    };

    private closeTeamContextMenu() {
        this.setState({
            showTeamContextMenu: false,
            teamContextMenuLeft: -1000,
            teamContextMenuTop: -1000,
        });
    }

    private onAddMembersClick = () => {
        this.props.onAddTeamMembersClick?.call(null, this.selectedTeamId || -1);
        this.closeTeamContextMenu();
    };

    private onShowMembersClick = () => {
        this.props.onShowTeamMembersClick?.call(
            null,
            this.selectedTeamId || -1,
        );
        this.closeTeamContextMenu();
    };

    private onShowInvitationsClick = () => {
        this.props.onShowInvitationsClick?.call(
            null,
            this.selectedTeamId || -1,
        );
        this.closeTeamContextMenu();
    };

    private onViewTeamSettingsClick = () => {
        this.props.onViewTeamSettingsClick?.call(
            null,
            this.selectedTeamId || -1,
        );
        this.closeTeamContextMenu();
    };
}
