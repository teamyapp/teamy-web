import moment from 'moment';
import React, { ChangeEvent, Component, ReactNode } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { ItemListUI } from '@lib/ui/ItemList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Group, GroupType } from '@core/entity/group';
import { UpdateGroupInput } from '@core/entity/input';

import styles from './EditGroupView.component.module.scss';

const groupTypeOptions: Option[] = [
    { key: 'STATIC', description: 'Static' },
    { key: 'FILTER', description: 'Filter' },
];

interface StaticGroupInput {
    memberIds: number[];
}

interface FilterGroupInput {
    filter: string;
}

interface Props {
    group: Group;
    membersLabel: string;
    memberLabel: string;
    renderInlineGroupMember: (memberId: number) => ReactNode;
    renderInlineRollout: (rolloutId: number) => ReactNode;
    isValidMember?: (memberId: number) => Promise<boolean>;
    isValidRollout?: (rolloutId: number) => Promise<boolean>;
    onCreateStaticGroup?: (groupName: string, memberIds: number[]) => void;
    onCreateFilterGroup?: (groupName: string, filter: string) => void;
    onDeleteGroupClick?: (groupId: number) => void;
    onSaveGroupClick?: (
        groupId: number,
        updatedGroup: UpdateGroupInput,
    ) => void;
}

interface State {
    group?: Group;
    selectedGroupType?: GroupType;
    groupName?: string;
    staticGroupInput?: StaticGroupInput;
    filterGroupInput?: FilterGroupInput;
    rolloutIds: number[];
}

export class EditGroupViewComponent extends Component<Props, State> {
    private readonly groupNameInputRef: React.RefObject<HTMLInputElement> =
        React.createRef();
    private readonly memberIdInputRef: React.RefObject<HTMLInputElement> =
        React.createRef();
    private readonly rolloutIdInputRef: React.RefObject<HTMLInputElement> =
        React.createRef();
    private readonly filterInputRef: React.RefObject<HTMLTextAreaElement> =
        React.createRef();
    private readonly groupTypeDropdownRef: React.RefObject<DropDownList> =
        React.createRef();

    constructor(props: Props) {
        super(props);

        this.state = {
            group: props.group,
            selectedGroupType: props.group.type,
            groupName: props.group.name,
            staticGroupInput: this.toStaticGroupInput(props.group),
            filterGroupInput: this.toFilterGroupInput(props.group),
            rolloutIds: props.group.rollouts.map((rollout) => rollout.id),
        };
    }

    render() {
        return (
            <div className={styles.EditGroupView}>
                <div className={`${styles.Info}`}>
                    {this.state.group?.locked && (
                        <div className={`${styles.Row} ${styles.Lock}`}>
                            <MaterialIconUI>lock</MaterialIconUI>
                        </div>
                    )}
                    <div
                        className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                    >
                        <div className={`${styles.Label} ${styles.SameRow}`}>
                            ID:
                        </div>
                        <div>{this.state.group?.id}</div>
                    </div>
                    <div
                        className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                    >
                        <div className={`${styles.Label} ${styles.SameRow}`}>
                            Group Name:
                        </div>
                        <input
                            ref={this.groupNameInputRef}
                            type={'text'}
                            className={styles.TextField}
                            value={this.state.groupName}
                            onChange={this.onGroupNameChange}
                        />
                    </div>
                    <div className={`${styles.Row} ${styles.Inline}`}>
                        <div className={`${styles.Label} ${styles.SameRow}`}>
                            Created At:
                        </div>
                        <div>
                            {moment(this.props.group.createdAt).fromNow()}
                        </div>
                    </div>
                    <div className={`${styles.Row} ${styles.Inline}`}>
                        <div className={`${styles.Label} ${styles.SameRow}`}>
                            Group Type:
                        </div>
                        <DropDownList
                            ref={this.groupTypeDropdownRef}
                            selectOptionKey={this.state.selectedGroupType}
                            options={groupTypeOptions}
                            onSelectOption={this.onSelectGroupType}
                        />
                    </div>
                    {this.renderGroupDetailSection()}
                    <div className={`${styles.Row} ${styles.Rollouts}`}>
                        <div className={`${styles.Label} ${styles.NextRow}`}>
                            Rollouts:
                        </div>
                        <ItemListUI
                            items={this.state.rolloutIds}
                            renderInlineItem={this.props.renderInlineRollout}
                            newItemInputLabel={'Enter rollout ID'}
                            parseNewItem={this.parseNewRollout}
                            isItemDuplicate={this.isRolloutDuplicate}
                            isItemValid={this.props.isValidRollout}
                            onAddItem={this.onAddRollout}
                            onRemoveItem={this.onRemoveRollout}
                        />
                    </div>
                </div>
                {!this.state.group?.locked && (
                    <div className={styles.Actions}>
                        <div
                            className={styles.SaveAction}
                            onClick={this.onSaveGroupClick}
                        >
                            <ButtonUI label={'Save'} />
                        </div>
                        <div
                            className={styles.DeleteAction}
                            onClick={this.onDeleteGroupClick}
                        >
                            <ButtonUI label={'Delete'} />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    private renderGroupDetailSection(): ReactNode {
        switch (this.state.selectedGroupType) {
            case 'STATIC':
                return this.renderStaticGroupDetailSection();
            case 'FILTER':
                return this.renderFilterGroupDetailSection();
        }
    }

    private renderStaticGroupDetailSection(): ReactNode {
        return (
            <div className={styles.Section}>
                <div className={styles.Row}>
                    <div className={`${styles.Label} ${styles.NextRow}`}>
                        {this.props.membersLabel}:
                    </div>
                    <ItemListUI
                        items={this.state.staticGroupInput?.memberIds || []}
                        renderInlineItem={this.props.renderInlineGroupMember}
                        newItemInputLabel={`Enter new ${this.props.membersLabel} ID`}
                        parseNewItem={this.parseNewMember}
                        isItemDuplicate={this.isMemberDuplicate}
                        isItemValid={this.props.isValidMember}
                        onAddItem={this.onAddMember}
                        onRemoveItem={this.onRemoveMember}
                    />
                </div>
            </div>
        );
    }

    private renderFilterGroupDetailSection(): ReactNode {
        return (
            <div className={styles.Section}>
                <div className={styles.Row}>
                    <div className={`${styles.Label} ${styles.NextRow}`}>
                        Filter:
                    </div>
                    <textarea
                        ref={this.filterInputRef}
                        className={`${styles.TextField} ${styles.Filter}`}
                        value={this.state.filterGroupInput?.filter}
                        onChange={this.onFilterChange}
                    />
                </div>
            </div>
        );
    }

    public show(group: Group) {
        this.setState({
            group: group,
            groupName: group.name,
            selectedGroupType: group.type,
            staticGroupInput: this.toStaticGroupInput(group),
            filterGroupInput: this.toFilterGroupInput(group),
            rolloutIds: group.rollouts.map((rollout) => rollout.id),
        });

        this.groupTypeDropdownRef.current?.selectOption(group.type);
    }

    private onSelectGroupType = (groupType: string) => {
        this.setState({
            selectedGroupType: groupType as GroupType,
        });
    };

    private parseNewRollout = (rolloutId: string): number => {
        return Number(rolloutId);
    };

    private isRolloutDuplicate = (rolloutId: number): boolean => {
        return this.state.rolloutIds.includes(rolloutId);
    };

    private onAddRollout = (rolloutId: number) => {
        this.setState({
            rolloutIds: [...this.state.rolloutIds, rolloutId],
        });
    };

    private onRemoveRollout = (rolloutId: number) => {
        this.setState({
            rolloutIds: this.state.rolloutIds.filter((id) => id !== rolloutId),
        });
    };

    private parseNewMember = (memberId: string): number => {
        return Number(memberId);
    };

    private isMemberDuplicate = (memberId: number): boolean => {
        return this.state.staticGroupInput!.memberIds.includes(memberId);
    };

    private onAddMember = (memberId: number) => {
        this.setState({
            staticGroupInput: {
                memberIds: [
                    ...this.state.staticGroupInput!.memberIds,
                    memberId,
                ],
            },
        });
    };

    private onRemoveMember = (memberId: number) => {
        this.setState({
            staticGroupInput: {
                memberIds: this.state.staticGroupInput!.memberIds.filter(
                    (id) => id !== memberId,
                ),
            },
        });
    };

    toStaticGroupInput(group: Group): StaticGroupInput {
        if (group.type !== 'STATIC') {
            return {
                memberIds: [],
            };
        }

        return {
            memberIds: group.members.map((member) => member.id),
        };
    }

    toFilterGroupInput(group: Group): FilterGroupInput {
        if (group.type !== 'FILTER') {
            return {
                filter: '',
            };
        }

        return {
            filter: group.filter,
        };
    }

    private onGroupNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            groupName: event.target.value,
        });
    };

    private onFilterChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({
            filterGroupInput: {
                filter: event.target.value,
            },
        });
    };

    private onSaveGroupClick = () => {
        this.props.onSaveGroupClick?.call(null, this.props.group.id, {
            name: this.state.groupName || this.props.group.name,
            type: this.state.selectedGroupType || this.props.group.type,
            groupMemberType: this.props.group.memberType,
            memberIds: this.state.staticGroupInput?.memberIds,
            filter: this.state.filterGroupInput?.filter,
            rolloutIds: this.state.rolloutIds,
        });
    };

    private onDeleteGroupClick = () => {
        this.props.onDeleteGroupClick?.call(null, this.state.group!.id);
    };
}
