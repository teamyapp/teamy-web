import moment from 'moment';
import React, {
    ChangeEvent,
    Component,
    KeyboardEvent,
    MouseEvent,
    ReactNode,
} from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Entity } from '@core/entity/entity';
import { Group } from '@core/entity/group';

import styles from './EditGroupView.component.module.scss';

type groupType = 'static' | 'filter';

const groupTypeOptions: Option[] = [
    { key: 'static', description: 'Static' },
    { key: 'filter', description: 'Filter' },
];

interface StaticGroupInput {
    memberIds: number[];
}

interface FilterGroupInput {
    filter: string;
}

interface Props<GroupMember> {
    group: Group<GroupMember>;
    membersLabel: string;
    memberLabel: string;
    renderInlineGroupMember: (memberId: number) => ReactNode;
    renderInlineRollout: (rolloutId: number) => ReactNode;
    isValidMember?: (memberId: number) => boolean;
    isValidRollout?: (rolloutId: number) => boolean;
    onCreateStaticGroup?: (groupName: string, memberIds: number[]) => void;
    onCreateFilterGroup?: (groupName: string, filter: string) => void;
}

interface State<GroupMember> {
    group?: Group<GroupMember>;
    selectedGroupType?: groupType;
    groupName?: string;
    staticGroupInput?: StaticGroupInput;
    filterGroupInput?: FilterGroupInput;
    rolloutIds: number[];
}

export class EditGroupViewComponent<
    GroupMember extends Entity,
> extends Component<Props<GroupMember>, State<GroupMember>> {
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

    constructor(props: Props<GroupMember>) {
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
                        <div className={styles.ItemList}>
                            {this.state.rolloutIds.map((rolloutId) => {
                                return (
                                    <div
                                        key={rolloutId}
                                        className={styles.Item}
                                    >
                                        {this.props.renderInlineRollout(
                                            rolloutId,
                                        )}
                                        <div
                                            className={styles.Remove}
                                            onClick={this.onRemoveRolloutClickHandler(
                                                rolloutId,
                                            )}
                                        >
                                            <MaterialIconUI>
                                                cancel
                                            </MaterialIconUI>
                                        </div>
                                    </div>
                                );
                            })}
                            <input
                                ref={this.rolloutIdInputRef}
                                type={'text'}
                                className={styles.Input}
                                placeholder={`Enter rollout ID`}
                                autoComplete={'off'}
                                data-1p-ignore={true}
                                onKeyDown={this.onRolloutIdInputKeydown}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.Actions}>
                    <div className={styles.SaveAction}>
                        <ButtonUI label={'Save'} />
                    </div>
                    <div className={styles.DeleteAction}>
                        <ButtonUI label={'Delete'} />
                    </div>
                </div>
            </div>
        );
    }

    private renderGroupDetailSection(): ReactNode {
        switch (this.state.selectedGroupType) {
            case 'static':
                return this.renderStaticGroupDetailSection();
            case 'filter':
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
                    <div className={styles.ItemList}>
                        {this.state.staticGroupInput?.memberIds.map(
                            (groupMemberId) => {
                                return (
                                    <div
                                        key={groupMemberId}
                                        className={styles.Item}
                                    >
                                        {this.props.renderInlineGroupMember(
                                            groupMemberId,
                                        )}
                                        <div
                                            className={styles.Remove}
                                            onClick={this.onRemoveMemberClickHandler(
                                                groupMemberId,
                                            )}
                                        >
                                            <MaterialIconUI>
                                                cancel
                                            </MaterialIconUI>
                                        </div>
                                    </div>
                                );
                            },
                        )}
                        <input
                            ref={this.memberIdInputRef}
                            type={'text'}
                            className={styles.Input}
                            placeholder={`Enter ${this.props.memberLabel} ID`}
                            autoComplete={'off'}
                            data-1p-ignore={true}
                            onKeyDown={this.onMemberIdInputKeydown}
                        />
                    </div>
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

    public show(group: Group<GroupMember>) {
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
            selectedGroupType: groupType as groupType,
        });
    };

    private onMemberIdInputKeydown = (
        event: KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.code === 'Enter') {
            let memberId = Number(this.memberIdInputRef.current?.value);
            if (memberId) {
                if (this.props.isValidMember?.call(null, memberId)) {
                    if (
                        !this.state.staticGroupInput!.memberIds.includes(
                            memberId,
                        )
                    ) {
                        // TODO: update group at backend
                        this.setState({
                            staticGroupInput: {
                                memberIds: [
                                    ...this.state.staticGroupInput!.memberIds,
                                    memberId,
                                ],
                            },
                        });
                    }
                }
            }

            this.memberIdInputRef.current!.value = '';
        }
    };

    private onRemoveMemberClickHandler = (memberId: number) => {
        return (event: MouseEvent) => {
            // TODO: update group at backend
            this.setState({
                staticGroupInput: {
                    memberIds: this.state.staticGroupInput!.memberIds.filter(
                        (id) => id !== memberId,
                    ),
                },
            });
        };
    };

    toStaticGroupInput(group: Group<GroupMember>): StaticGroupInput {
        if (group.type !== 'static') {
            return {
                memberIds: [],
            };
        }

        return {
            memberIds: group.members.map((member) => member.id),
        };
    }

    toFilterGroupInput(group: Group<GroupMember>): FilterGroupInput {
        if (group.type !== 'filter') {
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

    private onRolloutIdInputKeydown = (
        event: KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.code === 'Enter') {
            let rolloutId = Number(this.rolloutIdInputRef.current?.value);
            if (rolloutId) {
                if (this.props.isValidRollout?.call(null, rolloutId)) {
                    if (!this.state.rolloutIds.includes(rolloutId)) {
                        // TODO: update rollout at backend
                        this.setState({
                            rolloutIds: [...this.state.rolloutIds, rolloutId],
                        });
                    }
                }
            }

            this.rolloutIdInputRef.current!.value = '';
        }
    };

    private onRemoveRolloutClickHandler = (rolloutId: number) => {
        return (event: MouseEvent) => {
            this.setState({
                rolloutIds: this.state.rolloutIds.filter(
                    (id) => id !== rolloutId,
                ),
            });
        };
    };
}
