import React, { Component, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { BoundingBoxFinder } from '@lib/ui/position';

import { Deps } from '@core/dep/deps';
import { UpdateTaskInput } from '@core/entity/input';
import { User } from '@core/entity/user';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './SelectTaskOwnersPopupComponent.module.scss';
import { SelectUserListUI } from './SelectUserList';

const taskOwnersListVerticalOffset = 4;
const taskOwnersListHorizontalOffset = 10;

interface Props {
    deps: Deps;
    onClose?: () => void;
}

interface State {
    selectOwnerTaskId?: number;
    showPotentialTaskOwnersList: boolean;
    findTaskOwnersAlignTargetBoundBox?: BoundingBoxFinder;
    taskOwnersListVisible: boolean;
    taskOwnersListLeft: number;
    taskOwnersListTop: number;
    potentialTaskOwners: User[];
    selectedOwnerId?: number;
    selectOwnerUpdateTaskInput?: UpdateTaskInput;
}

export class SelectTaskOwnersPopupComponent extends Component<Props, State> {
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly taskOwnersPopupRef = createRef<HTMLDivElement>();

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
                        selectedUserId={this.state.selectedOwnerId}
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
        taskId: number,
        updateTaskInput: UpdateTaskInput,
        findAlignTargetBoundBox: BoundingBoxFinder,
        selectedOwnerId?: number,
    ) => {
        await this.stateSyncer.pullCurrentTeamMembers();
        const owners = this.graphSource.currentTeam()!.members;
        this.setState({
            potentialTaskOwners: owners,
            selectOwnerTaskId: taskId,
            selectedOwnerId,
            selectOwnerUpdateTaskInput: updateTaskInput,
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
            selectOwnerTaskId: undefined,
            taskOwnersListVisible: false,
            showPotentialTaskOwnersList: false,
        });
        this.props.onClose?.call(null);
    };

    private onSelectTaskOwner = (userId: number) => {
        this.stateSyncer.updateTask(
            this.state.selectOwnerTaskId!,
            Object.assign<any, UpdateTaskInput, Partial<UpdateTaskInput>>(
                {},
                this.state.selectOwnerUpdateTaskInput!,
                {
                    ownerUserId: userId,
                },
            ),
        );
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            selectedOwnerId: undefined,
            selectOwnerTaskId: undefined,
        });
    };

    private onRemoveTaskOwner = () => {
        this.stateSyncer.updateTask(
            this.state.selectOwnerTaskId!,
            Object.assign<any, UpdateTaskInput, Partial<UpdateTaskInput>>(
                {},
                this.state.selectOwnerUpdateTaskInput!,
                {
                    ownerUserId: undefined,
                },
            ),
        );
        this.setState({
            potentialTaskOwners: [],
            showPotentialTaskOwnersList: false,
            taskOwnersListVisible: false,
            selectedOwnerId: undefined,
            selectOwnerTaskId: undefined,
        });
    };

    private onWindowResize = () => {
        this.updateTaskOwnersListPosition();
    };
}
