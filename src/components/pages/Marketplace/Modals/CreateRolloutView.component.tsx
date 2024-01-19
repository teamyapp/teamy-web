import moment from 'moment';
import React, { Component, ReactNode, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { ItemListUI } from '@lib/ui/ItemList';
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

interface TimeRangeActivatorInput {
    startTime?: string;
    endTime?: string;
}

interface PercentageActivatorInput {
    percentage: number;
}

interface StaticVersionSelectorInput {
    versionNumber: number;
}

interface ExperimentVersionSelectorInput {
    versionNumbers: number[];
}

interface Props {
    groupLabel: string;
    renderInlineGroup: (groupId: number) => ReactNode;
    isValidGroup?: (groupId: number) => boolean;
    isValidVersionNumber?: (versionNumber: number) => boolean;
    onCreateClick?: (input: CreateAppRolloutInput) => void;
}

interface State {
    selectedActivatorType: ActivatorType;
    selectedVersionSelectorType: VersionSelectorType;
    timeRangeActivatorInput?: TimeRangeActivatorInput;
    percentageActivatorInput?: PercentageActivatorInput;
    staticVersionSelectorInput?: StaticVersionSelectorInput;
    experimentVersionSelectorInput?: ExperimentVersionSelectorInput;
    selectedGroupIds: number[];
}

export class CreateRolloutViewComponent extends Component<Props, State> {
    private readonly rolloutNameInputRef = createRef<HTMLInputElement>();
    private readonly rolloutEnableToggleRef = createRef<ToggleUI>();

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedActivatorType: 'static',
            selectedVersionSelectorType: 'static',
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
                    <ItemListUI
                        items={this.state.selectedGroupIds}
                        renderInlineItem={this.props.renderInlineGroup}
                        newItemInputLabel={`Enter ${this.props.groupLabel} ID`}
                        parseNewItem={this.parseNewGroup}
                        isItemDuplicate={this.isGroupDuplicate}
                        isItemValid={this.props.isValidGroup}
                        onAddItem={this.onAddGroup}
                        onRemoveItem={this.onRemoveGroup}
                    />
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
                        value={
                            this.state.timeRangeActivatorInput?.startTime || ''
                        }
                        onChange={this.onTimeRangeActivatorStartTimeChange}
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
                        value={
                            this.state.timeRangeActivatorInput?.endTime || ''
                        }
                        onChange={this.onTimeRangeActivatorEndTimeChange}
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
                        value={
                            this.state.percentageActivatorInput?.percentage ||
                            ''
                        }
                        onChange={this.onPercentageActivatorPercentageChange}
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
                    <input
                        type={'text'}
                        className={styles.TextField}
                        value={
                            this.state.staticVersionSelectorInput
                                ?.versionNumber || ''
                        }
                        onChange={
                            this.onStaticVersionSelectorVersionNumberChange
                        }
                    />
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
                    <ItemListUI
                        items={
                            this.state.experimentVersionSelectorInput
                                ?.versionNumbers || []
                        }
                        renderInlineItem={(versionNumber) => versionNumber}
                        newItemInputLabel={'Enter version number'}
                        parseNewItem={this.parseNewVersionNumber}
                        isItemDuplicate={this.isVersionNumberDuplicate}
                        isItemValid={this.props.isValidVersionNumber}
                        onAddItem={this.onAddVersionNumber}
                        onRemoveItem={this.onRemoveVersionNumber}
                    />
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

    parseNewVersionNumber(versionNumber: string): number {
        return Number(versionNumber);
    }

    isVersionNumberDuplicate(versionNumber: number): boolean {
        return (
            this.state.experimentVersionSelectorInput?.versionNumbers.includes(
                versionNumber,
            ) || false
        );
    }

    onAddVersionNumber = (versionNumber: number) => {
        this.setState({
            experimentVersionSelectorInput: {
                versionNumbers: [
                    ...(this.state.experimentVersionSelectorInput
                        ?.versionNumbers || []),
                    versionNumber,
                ],
            },
        });
    };

    onRemoveVersionNumber = (versionNumber: number) => {
        this.setState({
            experimentVersionSelectorInput: {
                versionNumbers:
                    this.state.experimentVersionSelectorInput?.versionNumbers.filter(
                        (currVersionNumber) =>
                            currVersionNumber !== versionNumber,
                    ) || [],
            },
        });
    };

    parseNewGroup(input: string): number {
        return Number(input);
    }

    isGroupDuplicate(groupId: number): boolean {
        return this.state.selectedGroupIds.includes(groupId);
    }

    onAddGroup = (groupId: number) => {
        this.setState({
            selectedGroupIds: [...this.state.selectedGroupIds, groupId],
        });
    };

    onRemoveGroup = (groupId: number) => {
        this.setState({
            selectedGroupIds: this.state.selectedGroupIds.filter(
                (currGroupId) => currGroupId !== groupId,
            ),
        });
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

    onTimeRangeActivatorStartTimeChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        this.setState({
            timeRangeActivatorInput: {
                ...this.state.timeRangeActivatorInput,
                startTime: event.target.value,
            },
        });
    };

    onTimeRangeActivatorEndTimeChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        this.setState({
            timeRangeActivatorInput: {
                ...this.state.timeRangeActivatorInput,
                endTime: event.target.value,
            },
        });
    };

    onPercentageActivatorPercentageChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        this.setState({
            percentageActivatorInput: {
                ...this.state.percentageActivatorInput,
                percentage: Number(event.target.value),
            },
        });
    };

    onStaticVersionSelectorVersionNumberChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        this.setState({
            staticVersionSelectorInput: {
                ...this.state.staticVersionSelectorInput,
                versionNumber: Number(event.target.value),
            },
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
                    this.state.timeRangeActivatorInput?.startTime;
                const endTimeText = this.state.timeRangeActivatorInput?.endTime;
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
                    this.state.percentageActivatorInput?.percentage;
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
                    versionNumber:
                        this.state.staticVersionSelectorInput?.versionNumber ||
                        0,
                };
            case 'experiment':
                return {
                    type: 'experiment',
                    versionNumbers:
                        this.state.experimentVersionSelectorInput
                            ?.versionNumbers || [],
                };
        }
    }
}
