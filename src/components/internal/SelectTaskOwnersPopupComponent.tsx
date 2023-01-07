import React, { Component, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { BoundingBoxFinder } from '@lib/ui/position';

import { Deps } from '@core/dep/deps';
import { User } from '@core/entity/user';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './SelectTaskOwnersPopupComponent.module.scss';
import { SelectUserListUI } from './SelectUserList';

const taskOwnersListVerticalOffset = 4;
const taskOwnersListHorizontalOffset = 10;

interface Props {
    deps: Deps;
    selectedOwnerId?: number,
    onClose?: () => void;
    onSelectOwner?: (taskOwnerId?: number) => void,
}

interface State {
    showPotentialTaskOwnersList: boolean;
    findTaskOwnersAlignTargetBoundBox?: BoundingBoxFinder;
    taskOwnersListVisible: boolean;
    taskOwnersListLeft: number;
    taskOwnersListTop: number;
    potentialTaskOwners: User[];
}

export class SelectTaskOwnersPopupComponent extends Component<Props, State> {
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly taskOwnersPopupRef = createRef<HTMLDivElement>();
    private onClose?: () => void;


    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            taskOwnersListLeft: 0,
            taskOwnersListTop: 0,
            potentialTaskOwners: [],
        };
    }

    render() {
        return (
            this.state.showPotentialTaskOwnersList && (
                <div
                    ref={this.taskOwnersPopupRef}
                    className={styles.SelectTaskOwnersPopup}
                    style={{
                        left: this.state.taskOwnersListLeft,
                        top: this.state.taskOwnersListTop,
                        visibility: this.state.taskOwnersListVisible
                            ? 'visible'
                            : 'hidden',
                    }}
                    tabIndex={-1}
                    onBlur={this.onCloseTaskOwnersListClick}
                >
                    <div className={styles.SelectTaskOwnerListHeader}>
                        <div
                            className={styles.CloseButton}
                            onClick={this.onCloseTaskOwnersListClick}
                        >
                            <MaterialIconUI>close</MaterialIconUI>
                        </div>
                    </div>
                    <SelectUserListUI
                        emptySelectionUserName={'Unassigned'}
                        selectedUserId={this.props.selectedOwnerId}
                        users={this.state.potentialTaskOwners}
                        onSelectUser={this.onSelectTaskOwner}
                        onRemoveSelection={this.onRemoveTaskOwner}
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

    public show = async (
        findAlignTargetBoundBox: BoundingBoxFinder,
        onClose?: () => void,
    ) => {
        this.onClose = onClose
        await this.stateSyncer.pullCurrentTeamMembers();
        const teamMembers = this.graphSource.currentTeam()!.members;
        this.setState({
            potentialTaskOwners: teamMembers.map(
                (teamMember) => teamMember.user,
            ),
            findTaskOwnersAlignTargetBoundBox: findAlignTargetBoundBox,
            showPotentialTaskOwnersList: true,
        });

        setTimeout(() => {
            this.setState({
                taskOwnersListVisible: true,
            });

            this.taskOwnersPopupRef.current?.focus();
            this.updateTaskOwnersListPosition();
        });
    };

    private updateTaskOwnersListPosition = () => {
        if (!this.state.showPotentialTaskOwnersList) {
            return;
        }

        if (!this.state.findTaskOwnersAlignTargetBoundBox) {
            return;
        }

        const boundingBox = this.state.findTaskOwnersAlignTargetBoundBox();
        const width = this.taskOwnersPopupRef.current?.offsetWidth || 0;
        const height = this.taskOwnersPopupRef.current?.offsetHeight || 0;
        const left = Math.min(
            boundingBox.left,
            document.body.clientWidth - width - taskOwnersListHorizontalOffset,
        );
        let top =
            boundingBox.top + boundingBox.height + taskOwnersListVerticalOffset;
        if (top + height > document.body.clientHeight) {
            top = boundingBox.top - height - taskOwnersListVerticalOffset;
        }

        this.setState({
            taskOwnersListLeft: left,
            taskOwnersListTop: top,
        });
    };

    private onCloseTaskOwnersListClick = () => {
        this.setState({
            potentialTaskOwners: [],
            taskOwnersListVisible: false,
            showPotentialTaskOwnersList: false,
        });
        this.onClose?.call(null)
        this.props.onClose?.call(null);
    };

    private onSelectTaskOwner = (userId: number) => {
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
        });
        this.props.onSelectOwner?.call(this, userId);
    };

    private onRemoveTaskOwner = () => {
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
        });
        this.props.onSelectOwner?.call(this);
    };

    private onWindowResize = () => {
        this.updateTaskOwnersListPosition();
    };
}
