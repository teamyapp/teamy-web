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
import {
    ActivatorType,
    AppRolloutType,
    VersionSelectorType,
} from '@core/entity/rollout';

import styles from './CreateRolloutView.component.module.scss';
import { RelativeLayout } from '@lib/layout';

const activatorTypeOptions: Option[] = [
    { key: 'STATIC', description: 'Static' },
    { key: 'TIME_RANGE', description: 'Time range' },
    { key: 'PERCENTAGE', description: 'Percentage' },
    { key: 'MAX_VIEWERS', description: 'Max viewers' },
];

const versionSelectorTypeOptions: Option[] = [
    { key: 'STATIC', description: 'Static' },
    { key: 'EXPERIMENT', description: 'Experiment' },
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

interface MaxViewersActivatorInput {
    maxViewers: number;
}

interface ExperimentVersionSelectorInput {
    versionNumbers: number[];
}

interface Props {
    relativeLayout: RelativeLayout;
    groupLabel: string;
    appRolloutType: AppRolloutType;
    renderInlineGroup: (groupId: number) => ReactNode;
    isValidGroup?: (groupId: number) => Promise<boolean>;
    isValidVersionNumber?: (versionNumber: number) => Promise<boolean>;
    onCreateRolloutClick: (input: CreateAppRolloutInput) => void;
    createActivator: (input: CreateActivatorInput) => Promise<number>;
    createVersionSelector: (
        input: CreateVersionSelectorInput,
    ) => Promise<number>;
}

interface State {
    selectedActivatorType: ActivatorType;
    selectedVersionSelectorType: VersionSelectorType;
    timeRangeActivatorInput?: TimeRangeActivatorInput;
    percentageActivatorInput?: PercentageActivatorInput;
    maxViewersActivatorInput?: MaxViewersActivatorInput;
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
            selectedActivatorType: 'STATIC',
            selectedVersionSelectorType: 'STATIC',
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
                        relativeLayout={this.props.relativeLayout}
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
                        relativeLayout={this.props.relativeLayout}
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
                        newItemInputLabel={`Enter group ID`}
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

    isVersionNumberDuplicate = (versionNumber: number): boolean => {
        return (
            this.state.experimentVersionSelectorInput?.versionNumbers.includes(
                versionNumber,
            ) || false
        );
    };

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

    isGroupDuplicate = (groupId: number): boolean => {
        return this.state.selectedGroupIds.includes(groupId);
    };

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

    onCreateRolloutClick = async () => {
        const hasVersionNumbers =
            this.state.experimentVersionSelectorInput?.versionNumbers &&
            this.state.experimentVersionSelectorInput.versionNumbers.length > 0;

        if (
            !this.state.staticVersionSelectorInput?.versionNumber &&
            !hasVersionNumbers
        ) {
            alert('Please enter version number');
            return;
        }

        const activatorId = await this.props.createActivator(
            this.getCreateActivatorInput(),
        );
        const versionSelectorId = await this.props.createVersionSelector(
            this.getCreateVersionSelectorInput(),
        );

        this.props.onCreateRolloutClick({
            name: this.rolloutNameInputRef.current?.value || '',
            type: this.props.appRolloutType,
            activatorId: activatorId,
            versionSelectorId: versionSelectorId,
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

    onMaxViewersActivatorMaxViewersChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        this.setState({
            maxViewersActivatorInput: {
                ...this.state.maxViewersActivatorInput,
                maxViewers: Number(event.target.value),
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

    private renderActivatorSection(): ReactNode {
        switch (this.state.selectedActivatorType) {
            case 'STATIC':
                return;
            case 'TIME_RANGE':
                return this.renderTimeRangeActivatorSection();
            case 'PERCENTAGE':
                return this.renderPercentageActivatorSection();
            case 'MAX_VIEWERS':
                return this.renderMaxViewersActivatorSection();
        }
    }

    private renderVersionSelectorSection(): ReactNode {
        switch (this.state.selectedVersionSelectorType) {
            case 'STATIC':
                return this.renderStaticVersionSelectorSection();
            case 'EXPERIMENT':
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

    private renderMaxViewersActivatorSection(): ReactNode {
        return (
            <div className={`${styles.ActivatorSection}`}>
                <div
                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                >
                    <div className={`${styles.Label} ${styles.SameRow}`}>
                        Max Viewers:
                    </div>
                    <input
                        type='number'
                        className={styles.TextField}
                        value={
                            this.state.maxViewersActivatorInput?.maxViewers || 0
                        }
                        onChange={this.onMaxViewersActivatorMaxViewersChange}
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
                        required
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

    private getCreateActivatorInput(): CreateActivatorInput {
        switch (this.state.selectedActivatorType) {
            case 'STATIC':
                return {
                    type: 'STATIC',
                };
            case 'TIME_RANGE':
                const startTimeText =
                    this.state.timeRangeActivatorInput?.startTime;
                const endTimeText = this.state.timeRangeActivatorInput?.endTime;
                return {
                    type: 'TIME_RANGE',
                    startAt: startTimeText
                        ? moment(startTimeText).toDate()
                        : undefined,
                    endAt: endTimeText
                        ? moment(endTimeText).toDate()
                        : undefined,
                };
            case 'PERCENTAGE':
                const percentageText =
                    this.state.percentageActivatorInput?.percentage;
                return {
                    type: 'PERCENTAGE',
                    percentage: percentageText ? Number(percentageText) : 0,
                };
            case 'MAX_VIEWERS':
                const maxViewersText =
                    this.state.maxViewersActivatorInput?.maxViewers;
                return {
                    type: 'MAX_VIEWERS',
                    maxViewers: maxViewersText ? Number(maxViewersText) : 0,
                };
        }
    }

    private getCreateVersionSelectorInput(): CreateVersionSelectorInput {
        switch (this.state.selectedVersionSelectorType) {
            case 'STATIC':
                return {
                    type: 'STATIC',
                    versionNumber:
                        this.state.staticVersionSelectorInput?.versionNumber ||
                        0,
                };
            case 'EXPERIMENT':
                return {
                    type: 'EXPERIMENT',
                    versionNumbers:
                        this.state.experimentVersionSelectorInput
                            ?.versionNumbers || [],
                };
        }
    }
}
