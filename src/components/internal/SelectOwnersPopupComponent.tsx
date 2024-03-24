import React, { Component, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { BoundingBoxFinder } from '@lib/ui/position';

import { Deps } from '@core/dep/deps';
import { User } from '@core/entity/user';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { SelectUserListUI } from './SelectUserList';
import styles from './SelectOwnersPopupComponent.module.scss';

const ownersListVerticalOffset = 4;
const ownersListHorizontalOffset = 10;

interface Props {
    deps: Deps;
    selectedOwnerId?: number;
    findOwnersAlignTargetBoundBox?: BoundingBoxFinder;
    onClose?: () => void;
    onSelectOwner?: (OwnerId?: number) => void;
}

interface State {
    showPotentialOwnersList: boolean;
    ownersListVisible: boolean;
    ownersListLeft: number;
    ownersListTop: number;
    potentialOwners: User[];
}

export class SelectOwnersPopupComponent extends Component<Props, State> {
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly ownersPopupRef = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            showPotentialOwnersList: false,
            ownersListVisible: false,
            ownersListLeft: 0,
            ownersListTop: 0,
            potentialOwners: [],
        };
    }

    render() {
        return (
            this.state.showPotentialOwnersList && (
                <div
                    ref={this.OwnersPopupRef}
                    className={styles.SelectOwnersPopup}
                    style={{
                        left: this.state.ownersListLeft,
                        top: this.state.ownersListTop,
                        visibility: this.state.ownersListVisible
                            ? 'visible'
                            : 'hidden',
                    }}
                    tabIndex={-1}
                    onBlur={this.onCloseOwnersListClick}
                >
                    <div className={styles.SelectOwnerListHeader}>
                        <div
                            className={styles.CloseButton}
                            onClick={this.onCloseOwnersListClick}
                        >
                            <MaterialIconUI>close</MaterialIconUI>
                        </div>
                    </div>
                    <SelectUserListUI
                        emptySelectionUserName={'Unassigned'}
                        selectedUserId={this.props.selectedOwnerId}
                        users={this.state.potentialOwners}
                        onSelectUser={this.onSelectOwner}
                        onRemoveSelection={this.onRemoveOwner}
                    />
                </div>
            )
        );
    }

    componentDidMount() {
        window.addEventListener('resize', this.onWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize);
    }

    public show = async () => {
        // TODO: use relative layout library
        await this.stateSyncer.pullCurrentTeamMembers();
        const teamMembers = this.graphSource.currentTeam()!.members;
        this.setState({
            potentialOwners: teamMembers.map(
                (teamMember) => teamMember.user,
            ),
            showPotentialOwnersList: true,
        });

        setTimeout(() => {
            this.setState({
                ownersListVisible: true,
            });

            this.ownersPopupRef.current?.focus();
            this.updateOwnersListPosition();
        });
    };

    private updateOwnersListPosition = () => {
        if (!this.state.showPotentialOwnersList) {
            return;
        }

        if (!this.props.findOwnersAlignTargetBoundBox) {
            return;
        }

        const boundingBox = this.props.findOwnersAlignTargetBoundBox();
        const width = this.ownersPopupRef.current?.offsetWidth || 0;
        const height = this.ownersPopupRef.current?.offsetHeight || 0;
        const left = Math.min(
            boundingBox.left,
            document.body.clientWidth - width - ownersListHorizontalOffset,
        );
        let top =
            boundingBox.top + boundingBox.height + ownersListVerticalOffset;
        if (top + height > document.body.clientHeight) {
            top = boundingBox.top - height - ownersListVerticalOffset;
        }

        this.setState({
            OwnersListLeft: left,
            OwnersListTop: top,
        });
    };

    private onCloseOwnersListClick = () => {
        this.setState({
            potentialOwners: [],
            OwnersListVisible: false,
            showPotentialOwnersList: false,
        });
        this.props.onClose?.call(null);
    };

    private onSelectOwner = (userId: number) => {
        this.setState({
            potentialOwners: [],
            showPotentialOwnersList: false,
            OwnersListVisible: false,
        });
        this.props.onSelectOwner?.call(this, userId);
    };

    private onRemoveOwner = () => {
        this.setState({
            potentialOwners: [],
            showPotentialOwnersList: false,
            OwnersListVisible: false,
        });
        this.props.onSelectOwner?.call(this);
    };

    private onWindowResize = () => {
        this.updateOwnersListPosition();
    };
}