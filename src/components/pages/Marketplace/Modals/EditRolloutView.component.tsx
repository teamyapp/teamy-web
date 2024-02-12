import moment from 'moment';
import React, {
    ChangeEvent,
    ForwardedRef,
    ReactNode,
    createRef,
    forwardRef,
    useImperativeHandle,
    useState,
} from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { ItemListUI } from '@lib/ui/ItemList';
import { ToggleUI } from '@lib/ui/Toggle';

import {
    CreateVersionSelectorInput,
    UpdateActivatorInput,
    UpdateRolloutInput,
    UpdateVersionSelectorInput,
} from '@core/entity/input';
import {
    ActivatorType,
    AppRolloutType,
    Rollout,
    VersionSelectorType,
} from '@core/entity/rollout';

import styles from './EditRolloutView.component.module.scss';

const activatorTypeOptions: Option[] = [
    { key: 'STATIC', description: 'Static' },
    { key: 'TIME_RANGE', description: 'Time range' },
    { key: 'MAX_VIEWERS', description: 'Max reviewers' },
    { key: 'PERCENTAGE', description: 'Percentage' },
];

const versionSelectorTypeOptions: Option[] = [
    { key: 'STATIC', description: 'Static' },
    { key: 'EXPERIMENT', description: 'Experiment' },
];

interface Props {
    rollout: Rollout;
    appRolloutType: AppRolloutType;
    renderInlineVersionNumber: (versionNumber: number) => ReactNode;
    isValidVersionNumber?: (versionNumber: number) => boolean;
    onSaveRolloutClick: (rollout: UpdateRolloutInput) => void;
    onDeleteRolloutClick: (rolloutId: number) => void;
    saveActivator: (
        activatorId: number,
        input: UpdateActivatorInput,
    ) => Promise<void>;
    saveVersionSelector: (
        versionSelectorId: number,
        input: UpdateVersionSelectorInput,
    ) => Promise<void>;
}

export interface EditRolloutViewComponentHandle {
    show(rollout: Rollout): void;
}

interface TimeRangeActivatorInput {
    startAt?: string;
    endAt?: string;
}

interface MaxViewersActivatorInput {
    maxViewers: number;
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

export function EditRolloutViewComponent() {
    return forwardRef(
        (props: Props, ref: ForwardedRef<EditRolloutViewComponentHandle>) => {
            const rolloutNameInputRef = createRef<HTMLInputElement>();
            const activatorTypeRef = createRef<DropDownList>();
            const versionSelectorTypeRef = createRef<DropDownList>();
            const timeRangeActivatorStartTimeInputRef =
                createRef<HTMLInputElement>();
            const staticVersionSelectorVersionNumberInputRef =
                createRef<HTMLInputElement>();
            const isEnabledToggleRef = createRef<ToggleUI>();

            const [rollout, setRollout] = useState<Rollout>(props.rollout);
            const [rolloutName, setRolloutName] = useState<string>(
                props.rollout.name,
            );
            const [activatorType, setActivatorType] = useState<ActivatorType>(
                props.rollout.activator.type,
            );
            const [versionSelectorType, setVersionSelectorType] =
                useState<VersionSelectorType>(
                    props.rollout.versionSelector.type,
                );
            const [timeRangeActivatorInput, setTimeRangeActivatorInput] =
                useState<TimeRangeActivatorInput | undefined>(
                    getTimeRangeActivatorInput(props.rollout),
                );
            const [percentageActivatorInput, setPercentageActivatorInput] =
                useState<PercentageActivatorInput | undefined>(
                    getPercentageActivatorInput(props.rollout),
                );
            const [maxViewersActivatorInput, setMaxViewersActivatorInput] =
                useState<MaxViewersActivatorInput | undefined>(
                    getMaxViewersActivatorInput(props.rollout),
                );
            const [staticVersionSelectorInput, setStaticVersionSelectorInput] =
                useState<StaticVersionSelectorInput | undefined>(
                    getStaticVersionSelectorInput(props.rollout),
                );
            const [
                experimentVersionSelectorInput,
                setExperimentVersionSelectorInput,
            ] = useState<ExperimentVersionSelectorInput | undefined>(
                getExperimentVersionSelectorInput(props.rollout),
            );
            const [isEnabled, setIsEnabled] = useState<boolean>(
                props.rollout.isEnabled,
            );

            const handleDeleteClicked = () => {
                props.onDeleteRolloutClick(rollout.id);
            };

            const getUpdateActivatorInput = (): UpdateActivatorInput => {
                switch (activatorType) {
                    case 'STATIC':
                        return {
                            type: 'STATIC',
                        };
                    case 'TIME_RANGE':
                        const startTimeText = timeRangeActivatorInput?.startAt;
                        const endTimeText = timeRangeActivatorInput?.endAt;
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
                            percentageActivatorInput?.percentage;
                        return {
                            type: 'PERCENTAGE',
                            percentage: percentageText
                                ? Number(percentageText)
                                : 0,
                        };
                    case 'MAX_VIEWERS':
                        const maxViewersText =
                            maxViewersActivatorInput?.maxViewers;
                        return {
                            type: 'MAX_VIEWERS',
                            maxViewers: maxViewersText
                                ? Number(maxViewersText)
                                : 0,
                        };
                }
            };

            const getUpdateVersionSelectorInput =
                (): CreateVersionSelectorInput => {
                    switch (versionSelectorType) {
                        case 'STATIC':
                            return {
                                type: 'STATIC',
                                versionNumber:
                                    staticVersionSelectorInput?.versionNumber ||
                                    0,
                            };
                        case 'EXPERIMENT':
                            return {
                                type: 'EXPERIMENT',
                                versionNumbers:
                                    experimentVersionSelectorInput?.versionNumbers ||
                                    [],
                            };
                    }
                };

            const handleSaveClicked = async () => {
                const hasVersionNumbers =
                    experimentVersionSelectorInput?.versionNumbers &&
                    experimentVersionSelectorInput?.versionNumbers.length > 0;

                if (
                    !staticVersionSelectorInput?.versionNumber &&
                    !hasVersionNumbers
                ) {
                    alert('Version number is required');
                    return;
                }

                await props.saveActivator(
                    rollout.activator.id,
                    getUpdateActivatorInput(),
                );

                await props.saveVersionSelector(
                    rollout.versionSelector.id,
                    getUpdateVersionSelectorInput(),
                );

                props.onSaveRolloutClick({
                    id: rollout.id,
                    name: rolloutName,
                    type: props.appRolloutType,
                    activatorId: rollout.activator.id,
                    versionSelectorId: rollout.versionSelector.id,
                    isEnabled: isEnabled,
                    groupIds: rollout.groups.map((group) => group.id),
                });
            };

            function getTimeRangeActivatorInput(rollout: Rollout) {
                return rollout.activator.type === 'TIME_RANGE'
                    ? {
                          startAt: formatDate(rollout.activator.startAt),
                          endAt: formatDate(rollout.activator.endAt),
                      }
                    : undefined;
            }

            function getPercentageActivatorInput(rollout: Rollout) {
                return rollout.activator.type === 'PERCENTAGE'
                    ? {
                          percentage: rollout.activator.percentage,
                      }
                    : undefined;
            }

            function getMaxViewersActivatorInput(rollout: Rollout) {
                return rollout.activator.type === 'MAX_VIEWERS'
                    ? {
                          maxViewers: rollout.activator.maxViewers,
                      }
                    : undefined;
            }

            function getStaticVersionSelectorInput(rollout: Rollout) {
                return rollout.versionSelector.type === 'STATIC'
                    ? {
                          versionNumber: rollout.versionSelector.versionNumber,
                      }
                    : undefined;
            }

            function getExperimentVersionSelectorInput(rollout: Rollout) {
                return rollout.versionSelector.type === 'EXPERIMENT'
                    ? {
                          versionNumbers:
                              rollout.versionSelector.versionNumbers,
                      }
                    : undefined;
            }

            useImperativeHandle(ref, () => {
                return {
                    show(rollout: Rollout) {
                        setRollout(rollout);
                        setRolloutName(rollout.name);
                        setActivatorType(rollout.activator.type);
                        setVersionSelectorType(rollout.versionSelector.type);
                        setTimeRangeActivatorInput(
                            getTimeRangeActivatorInput(rollout),
                        );
                        setPercentageActivatorInput(
                            getPercentageActivatorInput(rollout),
                        );
                        setMaxViewersActivatorInput(
                            getMaxViewersActivatorInput(rollout),
                        );
                        setStaticVersionSelectorInput(
                            getStaticVersionSelectorInput(rollout),
                        );
                        setExperimentVersionSelectorInput(
                            getExperimentVersionSelectorInput(rollout),
                        );
                        setIsEnabled(rollout.isEnabled);
                        activatorTypeRef.current?.selectOption(
                            rollout.activator.type,
                        );
                        versionSelectorTypeRef.current?.selectOption(
                            rollout.versionSelector.type,
                        );
                        isEnabledToggleRef.current?.setStatus(
                            rollout.isEnabled,
                        );
                    },
                };
            });

            const onRolloutNameChange = (
                event: React.ChangeEvent<HTMLInputElement>,
            ) => {
                setRolloutName(event.target.value);
            };

            const onSelectActivatorType = (activatorType: string) => {
                setActivatorType(activatorType as ActivatorType);
            };

            const onSelectVersionSelectorType = (
                versionSelectorType: string,
            ) => {
                setVersionSelectorType(
                    versionSelectorType as VersionSelectorType,
                );
            };

            const onTimeRangeActivatorStartTimeChange = (
                event: React.ChangeEvent<HTMLInputElement>,
            ) => {
                setTimeRangeActivatorInput({
                    ...timeRangeActivatorInput,
                    startAt: event.target.value,
                });
            };

            const onTimeRangeActivatorEndTimeChange = (
                event: ChangeEvent<HTMLInputElement>,
            ) => {
                setTimeRangeActivatorInput({
                    ...timeRangeActivatorInput,
                    endAt: event.target.value,
                });
            };

            const onMaxViewersActivatorChange = (
                event: ChangeEvent<HTMLInputElement>,
            ) => {
                setMaxViewersActivatorInput({
                    maxViewers: Number(event.target.value),
                });
            };

            const onPercentageActivatorPercentageChange = (
                event: ChangeEvent<HTMLInputElement>,
            ) => {
                setPercentageActivatorInput({
                    percentage: Number(event.target.value),
                });
            };

            const onStaticVersionSelectorVersionNumberChange = (
                event: ChangeEvent<HTMLInputElement>,
            ) => {
                setStaticVersionSelectorInput({
                    versionNumber: Number(event.target.value),
                });
            };

            const parseNewVersionNumber = (input: string) => {
                return Number(input);
            };

            const isVersionNumberDuplicate = (versionNumber: number) => {
                return (
                    experimentVersionSelectorInput?.versionNumbers.includes(
                        versionNumber,
                    ) || false
                );
            };

            const onAddVersionNumber = (versionNumber: number) => {
                setExperimentVersionSelectorInput({
                    versionNumbers: [
                        ...(experimentVersionSelectorInput?.versionNumbers ??
                            []),
                        versionNumber,
                    ],
                });
            };

            const onRemoveVersionNumber = (versionNumber: number) => {
                setExperimentVersionSelectorInput({
                    versionNumbers:
                        experimentVersionSelectorInput?.versionNumbers.filter(
                            (currVersionNumber) =>
                                currVersionNumber !== versionNumber,
                        ) ?? [],
                });
            };

            const onIsEnabledChange = (isEnabled: boolean) => {
                setIsEnabled(isEnabled);
            };

            const renderActivatorDetailSection = () => {
                switch (activatorType) {
                    case 'STATIC':
                        break;
                    case 'TIME_RANGE':
                        return (
                            <div className={styles.Section}>
                                <div
                                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                                >
                                    <div
                                        className={`${styles.Label} ${styles.SameRow}`}
                                    >
                                        Start Time:
                                    </div>
                                    <input
                                        ref={
                                            timeRangeActivatorStartTimeInputRef
                                        }
                                        type={'text'}
                                        className={styles.TextField}
                                        value={
                                            timeRangeActivatorInput?.startAt ||
                                            ''
                                        }
                                        placeholder={'YYYY/MM/DD HH:MM:SS'}
                                        onChange={
                                            onTimeRangeActivatorStartTimeChange
                                        }
                                    />
                                </div>
                                <div
                                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                                >
                                    <div
                                        className={`${styles.Label} ${styles.SameRow}`}
                                    >
                                        End Time:
                                    </div>
                                    <input
                                        type={'text'}
                                        className={styles.TextField}
                                        value={
                                            timeRangeActivatorInput?.endAt || ''
                                        }
                                        placeholder={'YYYY/MM/DD HH:MM:SS'}
                                        onChange={
                                            onTimeRangeActivatorEndTimeChange
                                        }
                                    />
                                </div>
                            </div>
                        );
                    case 'PERCENTAGE':
                        return (
                            <div className={styles.Section}>
                                <div
                                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                                >
                                    <div
                                        className={`${styles.Label} ${styles.SameRow}`}
                                    >
                                        Percentage:
                                    </div>
                                    <input
                                        type={'text'}
                                        className={styles.TextField}
                                        value={
                                            percentageActivatorInput?.percentage ||
                                            ''
                                        }
                                        placeholder={'0-100'}
                                        onChange={
                                            onPercentageActivatorPercentageChange
                                        }
                                    />
                                </div>
                            </div>
                        );
                    case 'MAX_VIEWERS':
                        return (
                            <div className={styles.Section}>
                                <div
                                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                                >
                                    <div
                                        className={`${styles.Label} ${styles.SameRow}`}
                                    >
                                        Max Viewers:
                                    </div>
                                    <input
                                        type='number'
                                        className={styles.TextField}
                                        value={
                                            maxViewersActivatorInput?.maxViewers ||
                                            ''
                                        }
                                        onChange={onMaxViewersActivatorChange}
                                    />
                                </div>
                            </div>
                        );
                }
            };

            const renderVersionSelectorDetailSection = () => {
                switch (versionSelectorType) {
                    case 'STATIC':
                        return (
                            <div className={styles.Section}>
                                <div
                                    className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                                >
                                    <div
                                        className={`${styles.Label} ${styles.SameRow}`}
                                    >
                                        Version Number:
                                    </div>
                                    <input
                                        ref={
                                            staticVersionSelectorVersionNumberInputRef
                                        }
                                        type={'text'}
                                        className={styles.TextField}
                                        value={
                                            staticVersionSelectorInput?.versionNumber ||
                                            ''
                                        }
                                        onChange={
                                            onStaticVersionSelectorVersionNumberChange
                                        }
                                    />
                                </div>
                            </div>
                        );
                    case 'EXPERIMENT':
                        return (
                            <div className={styles.Section}>
                                <div className={`${styles.Row}`}>
                                    <div
                                        className={`${styles.Label} ${styles.NextRow}`}
                                    >
                                        Version Numbers:
                                    </div>
                                    <ItemListUI
                                        items={
                                            experimentVersionSelectorInput?.versionNumbers ||
                                            []
                                        }
                                        renderInlineItem={
                                            props.renderInlineVersionNumber
                                        }
                                        newItemInputLabel={
                                            'Enter version number'
                                        }
                                        parseNewItem={parseNewVersionNumber}
                                        isItemValid={props.isValidVersionNumber}
                                        isItemDuplicate={
                                            isVersionNumberDuplicate
                                        }
                                        onAddItem={onAddVersionNumber}
                                        onRemoveItem={onRemoveVersionNumber}
                                    />
                                </div>
                            </div>
                        );
                }
            };

            return (
                <div className={styles.EditRolloutView}>
                    <div className={`${styles.Info}`}>
                        <div
                            className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                        >
                            <div
                                className={`${styles.Label} ${styles.SameRow}`}
                            >
                                ID:
                            </div>
                            <div>{rollout?.id}</div>
                        </div>
                        <div
                            className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                        >
                            <div
                                className={`${styles.Label} ${styles.SameRow}`}
                            >
                                Rollout Name:
                            </div>
                            <input
                                ref={rolloutNameInputRef}
                                type={'text'}
                                className={styles.TextField}
                                value={rolloutName}
                                onChange={onRolloutNameChange}
                            />
                        </div>
                        <div
                            className={`${styles.Row} ${styles.Inline} ${styles.Text}`}
                        >
                            <div
                                className={`${styles.Label} ${styles.SameRow}`}
                            >
                                Created At:
                            </div>
                            <div>{moment(rollout?.createdAt).fromNow()}</div>
                        </div>
                        <div className={`${styles.Row} ${styles.Inline}`}>
                            <div
                                className={`${styles.Label} ${styles.SameRow}`}
                            >
                                Activator Type:
                            </div>
                            <DropDownList
                                ref={activatorTypeRef}
                                selectOptionKey={activatorType}
                                options={activatorTypeOptions}
                                onSelectOption={onSelectActivatorType}
                            />
                        </div>
                        {renderActivatorDetailSection()}
                        <div className={`${styles.Row} ${styles.Inline}`}>
                            <div
                                className={`${styles.Label} ${styles.SameRow}`}
                            >
                                Version Selector Type:
                            </div>
                            <DropDownList
                                ref={versionSelectorTypeRef}
                                selectOptionKey={versionSelectorType}
                                options={versionSelectorTypeOptions}
                                onSelectOption={onSelectVersionSelectorType}
                            />
                        </div>
                        {renderVersionSelectorDetailSection()}
                        <div
                            className={`${styles.Row} ${styles.Inline} ${styles.Toggle}`}
                        >
                            <div
                                className={`${styles.Label} ${styles.SameRow}`}
                            >
                                Enable:
                            </div>
                            <ToggleUI
                                ref={isEnabledToggleRef}
                                defaultEnable={isEnabled}
                                onStatusChange={onIsEnabledChange}
                            />
                        </div>
                    </div>
                    <div className={styles.Actions}>
                        <div
                            className={styles.SaveAction}
                            onClick={handleSaveClicked}
                        >
                            <ButtonUI label={'Save'} />
                        </div>
                        <div
                            className={styles.DeleteAction}
                            onClick={handleDeleteClicked}
                        >
                            <ButtonUI label={'Delete'} />
                        </div>
                    </div>
                </div>
            );
        },
    );
}

function formatDate(date: Date | undefined): string {
    return date ? moment(date).format('MM/DD/YYYY h:mm:ss') : '';
}
