import moment from 'moment';
import React, { Component, KeyboardEvent, ReactNode, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ToggleUI } from '@lib/ui/Toggle';

import {
    CreateActivatorInput,
    CreateAppRolloutInput,
    CreateVersionSelectorInput,
} from '@core/entity/input';

import styles from './CreateRolloutView.component.module.scss';

type ActivatorType = 'static' | 'timeRange' | 'percentage';
type VersionSelectorType = 'static' | 'experiment';

const activatorTypeOptions: Option[] = [
    { key: 'static', description: 'Static' },
    { key: 'timeRange', description: 'Time range' },
    { key: 'percentage', description: 'Percentage' },
];

const versionSelectorTypeOptions: Option[] = [
    { key: 'static', description: 'Static' },
    { key: 'experiment', description: 'Experiment' },
];

interface Props {
    groupLabel: string;
    renderInlineGroup: (groupId: number) => ReactNode;
    isValidGroup?: (groupId: number) => boolean;
    onCreateClick?: (input: CreateAppRolloutInput) => void;
}

interface State {
    selectedActivatorType: ActivatorType;
    selectedVersionSelectorType: VersionSelectorType;
    staticVersionNumber?: number;
    versionNumbers: number[];
    selectedGroupIds: number[];
}

export class CreateRolloutViewComponent extends Component<Props, State> {
    private readonly rolloutNameInputRef = createRef<HTMLInputElement>();
    private readonly rolloutEnableToggleRef = createRef<ToggleUI>();
    private readonly timeRangeActivatorStartTimeInputRef =
        createRef<HTMLInputElement>();
    private readonly timeRangeActivatorEndTimeInputRef =
        createRef<HTMLInputElement>();
    private readonly percentageActivatorPercentageInputRef =
        createRef<HTMLInputElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedActivatorType: 'static',
            selectedVersionSelectorType: 'static',
            versionNumbers: [],
            selectedGroupIds: [],
        };
    }

    render() {
        return (
            <div className={styles.CreateRolloutView}>
                <div
                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                >
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Rollout Name:
                    </div>
                    <input
                        type={'text'}
                        className={styles.TextField}
                        ref={this.rolloutNameInputRef}
                    />
                </div>
                <div
                    className={`${styles.Row} ${styles.Inline} ${styles.Activator}`}
                >
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Activator Type:
                    </div>
                    <DropDownList
                        selectOptionKey={this.state.selectedActivatorType}
                        options={activatorTypeOptions}
                        onSelectOption={this.onSelectActivatorType}
                    />
                </div>
                {this.renderActivatorSection()}
                <div
                    className={`${styles.Row} ${styles.Inline} ${styles.VersionSelector}`}
                >
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Version Selector Type:
                    </div>
                    <DropDownList
                        selectOptionKey={this.state.selectedVersionSelectorType}
                        options={versionSelectorTypeOptions}
                        onSelectOption={this.onSelectVersionSelectorType}
                    />
                </div>
                {this.renderVersionSelectorSection()}
                <div className={styles.Row}>
                    <div className={`${styles.Label} ${styles.NextRow}`}>
                        Target {this.props.groupLabel} Groups:
                    </div>
                    <div className={styles.ItemList}>
                        {this.state.selectedGroupIds.map((selectedGroupId) => {
                            return (
                                <div className={styles.Item}>
                                    {this.props.renderInlineGroup(
                                        selectedGroupId,
                                    )}
                                    <div className={styles.Remove}>
                                        <MaterialIconUI>cancel</MaterialIconUI>
                                    </div>
                                </div>
                            );
                        })}
                        <input
                            type={'text'}
                            className={styles.Input}
                            placeholder={`Enter group ID`}
                            autoComplete={'off'}
                            data-1p-ignore={true}
                            onKeyDown={this.onGroupIdInputKeydown}
                        />
                    </div>
                </div>
                <div
                    className={`${styles.Row} ${styles.Inline} ${styles.Toggle}`}
                >
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Enable:
                    </div>
                    <ToggleUI
                        ref={this.rolloutEnableToggleRef}
                        defaultEnable={true}
                    />
                </div>
                <div className={styles.Actions}>
                    <div className={styles.CreateAction}>
                        <ButtonUI
                            label={'Create'}
                            onClick={this.onCreateRolloutClick}
                        />
                    </div>
                </div>
            </div>
        );
    }

    private renderActivatorSection(): ReactNode {
        switch (this.state.selectedActivatorType) {
            case 'static':
                return;
            case 'timeRange':
                return this.renderTimeRangeActivatorSection();
            case 'percentage':
                return this.renderPercentageActivatorSection();
        }
    }

    private renderVersionSelectorSection(): ReactNode {
        switch (this.state.selectedVersionSelectorType) {
            case 'static':
                return this.renderStaticVersionSelectorSection();
            case 'experiment':
                return this.renderExperimentVersionSelectorSection();
        }
    }

    private renderTimeRangeActivatorSection(): ReactNode {
        return (
            <div className={`${styles.ActivatorSection}`}>
                <div
                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                >
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Start Time:
                    </div>
                    <input
                        type={'text'}
                        className={styles.TextField}
                        placeholder={'MM/DD/YYYY HH:MM:SS'}
                    />
                </div>
                <div
                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                >
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        End Time:
                    </div>
                    <input
                        type={'text'}
                        className={styles.TextField}
                        placeholder={'MM/DD/YYYY HH:MM:SS'}
                    />
                </div>
            </div>
        );
    }

    private renderPercentageActivatorSection(): ReactNode {
        return (
            <div className={`${styles.ActivatorSection}`}>
                <div
                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                >
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Percentage:
                    </div>
                    <input
                        type={'text'}
                        className={styles.TextField}
                        placeholder={'0-100'}
                    />
                </div>
            </div>
        );
    }

    private renderStaticVersionSelectorSection(): ReactNode {
        return (
            <div className={`${styles.VersionSelectorSection}`}>
                <div
                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                >
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Version Number:
                    </div>
                    <input type={'text'} className={styles.TextField} />
                </div>
            </div>
        );
    }

    private renderExperimentVersionSelectorSection(): ReactNode {
        return (
            <div className={`${styles.VersionSelectorSection}`}>
                <div className={styles.Row}>
                    <div className={`${styles.Label} ${styles.NextRow}`}>
                        Version Numbers:
                    </div>
                    <div className={styles.ItemList}>
                        {this.state.versionNumbers.map((versionNumber) => {
                            return (
                                <div className={styles.Item}>
                                    {versionNumber}
                                    <div className={styles.Remove}>
                                        <MaterialIconUI>cancel</MaterialIconUI>
                                    </div>
                                </div>
                            );
                        })}
                        <input
                            type={'text'}
                            className={styles.Input}
                            placeholder={`Enter version number`}
                            autoComplete={'off'}
                            data-1p-ignore={true}
                            onKeyDown={this.onVersionNumberInputKeydown}
                        />
                    </div>
                </div>
            </div>
        );
    }

    onSelectActivatorType = (activatorType: string) => {
        this.setState({
            selectedActivatorType: activatorType as ActivatorType,
        });
    };

    onSelectVersionSelectorType = (versionSelectorType: string) => {
        this.setState({
            selectedVersionSelectorType:
                versionSelectorType as VersionSelectorType,
        });
    };

    onVersionNumberInputKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const versionNumber = Number(event.currentTarget.value);
            if (!isNaN(versionNumber)) {
                if (!this.state.versionNumbers.includes(versionNumber)) {
                    this.setState({
                        versionNumbers: [
                            ...this.state.versionNumbers,
                            versionNumber,
                        ],
                    });
                }
            }

            event.currentTarget.value = '';
        }
    };

    onGroupIdInputKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const groupId = Number(event.currentTarget.value);
            if (this.props.isValidGroup?.call(null, groupId)) {
                if (!this.state.selectedGroupIds.includes(groupId)) {
                    this.setState({
                        selectedGroupIds: [
                            ...this.state.selectedGroupIds,
                            groupId,
                        ],
                    });
                }
            }

            event.currentTarget.value = '';
        }
    };

    onCreateRolloutClick = () => {
        this.props.onCreateClick?.({
            name: this.rolloutNameInputRef.current?.value || '',
            activator: this.getCreateActivatorInput(),
            versionSelector: this.getCreateVersionSelectorInput(),
            groupIds: this.state.selectedGroupIds,
            isEnabled: this.rolloutEnableToggleRef.current?.status || false,
        });
    };

    private getCreateActivatorInput(): CreateActivatorInput {
        switch (this.state.selectedActivatorType) {
            case 'static':
                return {
                    type: 'static',
                };
            case 'timeRange':
                const startTimeText =
                    this.timeRangeActivatorStartTimeInputRef.current?.value;
                const endTimeText =
                    this.timeRangeActivatorEndTimeInputRef.current?.value;
                return {
                    type: 'timeRange',
                    startAt: startTimeText
                        ? moment(startTimeText).toDate()
                        : undefined,
                    endAt: endTimeText
                        ? moment(endTimeText).toDate()
                        : undefined,
                };
            case 'percentage':
                const percentageText =
                    this.percentageActivatorPercentageInputRef.current?.value;
                return {
                    type: 'percentage',
                    percentage: percentageText ? Number(percentageText) : 0,
                };
        }
    }

    private getCreateVersionSelectorInput(): CreateVersionSelectorInput {
        switch (this.state.selectedVersionSelectorType) {
            case 'static':
                return {
                    type: 'static',
                    versionNumber: this.state.staticVersionNumber || 0,
                };
            case 'experiment':
                return {
                    type: 'experiment',
                    versionNumbers: this.state.versionNumbers,
                };
        }
    }
}
