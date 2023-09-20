import React, { Component, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import styles from './CreateGroupView.component.module.scss';

type groupType = 'static' | 'filter';

const groupTypeOptions: Option[] = [
    { key: 'static', description: 'Static' },
    { key: 'filter', description: 'Filter' },
];

interface Props {
    membersLabel: string;
    memberLabel: string;
    renderInlineGroupMember: (memberId: number) => ReactNode;
    isValidMember?: (memberId: number) => boolean;
    onCreateStaticGroup?: (groupName: string, memberIds: number[]) => void;
    onCreateFilterGroup?: (groupName: string, filter: string) => void;
}

interface State {
    selectedGroupType: groupType;
    groupMemberIds: number[];
}

export class CreateGroupViewComponent extends Component<Props, State> {
    private readonly groupNameInputRef: React.RefObject<HTMLInputElement> =
        React.createRef();
    private readonly memberIdInputRef: React.RefObject<HTMLInputElement> =
        React.createRef();
    private readonly filterInputRef: React.RefObject<HTMLTextAreaElement> =
        React.createRef();

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedGroupType: 'static',
            groupMemberIds: [],
        };
    }

    render() {
        return (
            <div className={styles.CreateGroupView}>
                <div className={`${styles.Row} ${styles.Inline}`}>
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Group Name:
                    </div>
                    <input
                        ref={this.groupNameInputRef}
                        type={'text'}
                        className={styles.TextField}
                    />
                </div>
                <div className={`${styles.Row} ${styles.Inline}`}>
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Group Type:
                    </div>
                    <DropDownList
                        selectOptionKey={this.state.selectedGroupType}
                        options={groupTypeOptions}
                        onSelectOption={this.onSelectGroupType}
                    />
                </div>
                {this.renderGroupDetailSection()}
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
            <>
                <div className={styles.Row}>
                    <div className={`${styles.Label} ${styles.NextRow}`}>
                        {this.props.membersLabel}:
                    </div>
                    <div className={styles.Members}>
                        {this.state.groupMemberIds.map((groupMemberId) => {
                            return (
                                <div className={styles.GroupMember}>
                                    {this.props.renderInlineGroupMember(
                                        groupMemberId,
                                    )}
                                    <div
                                        className={styles.Remove}
                                        onClick={this.onRemoveMemberClickHandler(
                                            groupMemberId,
                                        )}
                                    >
                                        <MaterialIconUI>cancel</MaterialIconUI>
                                    </div>
                                </div>
                            );
                        })}
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
                <div className={styles.Actions}>
                    <div className={styles.CreateAction}>
                        <ButtonUI
                            label={'Create'}
                            onClick={this.onCreateStaticGroupClick}
                        />
                    </div>
                </div>
            </>
        );
    }

    private renderFilterGroupDetailSection(): ReactNode {
        return (
            <>
                <div className={styles.Row}>
                    <div className={`${styles.Label} ${styles.NextRow}`}>
                        Filter:
                    </div>
                    <textarea
                        ref={this.filterInputRef}
                        className={`${styles.TextField} ${styles.Filter}`}
                    />
                </div>
                <div className={styles.Actions}>
                    <div className={styles.CreateAction}>
                        <ButtonUI
                            label={'Create'}
                            onClick={this.onCreateFilterGroupClick}
                        />
                    </div>
                </div>
            </>
        );
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
                    if (!this.state.groupMemberIds.includes(memberId)) {
                        this.setState({
                            groupMemberIds: [
                                ...this.state.groupMemberIds,
                                memberId,
                            ],
                        });
                    }
                }
            }

            this.memberIdInputRef.current!.value = '';
        }
    };

    private onRemoveMemberClickHandler = (memberId: number) => {
        return (event: MouseEvent) => {
            this.setState({
                groupMemberIds: this.state.groupMemberIds.filter(
                    (id) => id !== memberId,
                ),
            });
        };
    };

    private onCreateStaticGroupClick = () => {
        let groupName = this.groupNameInputRef.current?.value || '';
        let memberIds = this.state.groupMemberIds;
        this.props.onCreateStaticGroup?.call(null, groupName, memberIds);
    };

    private onCreateFilterGroupClick = () => {
        let groupName = this.groupNameInputRef.current?.value || '';
        let filter = this.filterInputRef.current?.value || '';
        this.props.onCreateFilterGroup?.call(null, groupName, filter);
    };
}
