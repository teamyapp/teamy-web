import React, { Component, ReactNode, RefObject, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { ItemListUI } from '@lib/ui/ItemList';

import { GroupType } from '@core/entity/group';

import styles from './CreateGroupView.component.module.scss';

const groupTypeOptions: Option[] = [
    { key: 'STATIC', description: 'Static' },
    { key: 'FILTER', description: 'Filter' },
];

interface StaticInput {
    memberIds: number[];
}

interface FilterInput {
    filter: string;
}

interface Props {
    membersLabel: string;
    memberLabel: string;
    renderInlineGroupMember: (memberId: number) => ReactNode;
    isValidMember?: (memberId: number) => boolean;
    onCreateStaticGroup?: (groupName: string, memberIds: number[]) => void;
    onCreateFilterGroup?: (groupName: string, filter: string) => void;
}

interface State {
    selectedGroupType: GroupType;
    staticInput?: StaticInput;
    filterInput?: FilterInput;
}

export class CreateGroupViewComponent extends Component<Props, State> {
    private readonly groupNameInputRef: RefObject<HTMLInputElement> =
        createRef();
    private readonly filterInputRef: RefObject<HTMLTextAreaElement> =
        createRef();

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedGroupType: 'STATIC',
        };
    }

    render() {
        return (
            <div className={styles.CreateGroupView}>
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
            case 'STATIC':
                return this.renderStaticGroupDetailSection();
            case 'FILTER':
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
                    <ItemListUI
                        items={this.state.staticInput?.memberIds || []}
                        renderInlineItem={this.props.renderInlineGroupMember}
                        newItemInputLabel={`Enter ${this.props.memberLabel} ID`}
                        parseNewItem={this.parseNewGroupMember}
                        isItemValid={this.props.isValidMember}
                        isItemDuplicate={this.isDuplicateGroupMember}
                        onAddItem={this.addNewGroupMember}
                        onRemoveItem={this.removeGroupMember}
                    />
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
                        value={this.state.filterInput?.filter || ''}
                        onChange={this.onFilterGroupFilterChange}
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
            selectedGroupType: groupType as GroupType,
        });
    };

    private parseNewGroupMember = (input: string): number => {
        return Number(input);
    };

    private isDuplicateGroupMember = (memberId: number): boolean => {
        return this.state.staticInput?.memberIds.includes(memberId) || false;
    };

    private addNewGroupMember = (memberId: number) => {
        this.setState({
            staticInput: {
                memberIds: [
                    ...(this.state.staticInput?.memberIds || []),
                    memberId,
                ],
            },
        });
    };

    private removeGroupMember = (memberId: number) => {
        this.setState({
            staticInput: {
                memberIds:
                    this.state.staticInput?.memberIds.filter(
                        (id) => id !== memberId,
                    ) || [],
            },
        });
    };

    private onFilterGroupFilterChange = () => {
        this.setState({
            filterInput: {
                filter: this.filterInputRef.current?.value || '',
            },
        });
    };

    private onCreateStaticGroupClick = () => {
        let groupName = this.groupNameInputRef.current?.value || '';
        let memberIds = this.state.staticInput?.memberIds || [];
        this.props.onCreateStaticGroup?.call(null, groupName, memberIds);
    };

    private onCreateFilterGroupClick = () => {
        let groupName = this.groupNameInputRef.current?.value || '';
        let filter = this.state.filterInput?.filter || '';
        this.props.onCreateFilterGroup?.call(null, groupName, filter);
    };
}
