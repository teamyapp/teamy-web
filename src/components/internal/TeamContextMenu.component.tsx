import React, { Component, RefObject, createRef } from 'react';

import styles from './TeamContextMenu.component.module.scss';

interface Props {
    onAddMembersClick?: () => void;
    onShowMembersClick?: () => void;
    onShowInvitationsClick?: () => void;
    onViewTeamSettingsClick?: () => void;
}

interface State {
    show: boolean;
    top: number;
    left: number;
}

export class TeamContextMenuComponent extends Component<Props, State> {
    private contextMenuRef: RefObject<any> = createRef();

    constructor(props: Props) {
        super(props);
        this.state = {
            show: false,
            top: 0,
            left: 0,
        };
    }

    render() {
        return (
            this.state.show && (
                <ul
                    ref={this.contextMenuRef}
                    className={styles.TeamContextMenu}
                    tabIndex={-1}
                    style={{
                        top: this.state.top,
                        left: this.state.left,
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
            )
        );
    }

    public open(top: number, left: number) {
        this.setState(
            {
                show: true,
                top: top,
                left: left,
            },
            () => this.contextMenuRef.current?.focus(),
        );
    }

    private onTeamContextMenuBlur = () => {
        this.close();
    };

    private close() {
        this.setState({
            show: false,
            top: 0,
            left: 0,
        });
    }

    private onAddMembersClick = () => {
        this.props.onAddMembersClick?.call(null);
        this.close();
    };

    private onShowMembersClick = () => {
        this.props.onShowMembersClick?.call(null);
        this.close();
    };

    private onShowInvitationsClick = () => {
        this.props.onShowInvitationsClick?.call(null);
        this.close();
    };

    private onViewTeamSettingsClick = () => {
        this.props.onViewTeamSettingsClick?.call(null);
        this.close();
    };
}
