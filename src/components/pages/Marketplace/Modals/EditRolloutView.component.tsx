import moment from 'moment';
import React, {
    ForwardedRef,
    ReactNode,
    createRef,
    forwardRef,
    useImperativeHandle,
    useState,
} from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Rollout } from '@core/entity/rollout';

import styles from './EditRolloutView.component.module.scss';

const activatorTypeOptions: Option[] = [
    { key: 'static', description: 'Static' },
    { key: 'timeRange', description: 'Time range' },
    { key: 'percentage', description: 'Percentage' },
];

const versionSelectorTypeOptions: Option[] = [
    { key: 'static', description: 'Static' },
    { key: 'experiment', description: 'Experiment' },
];

interface Props<GroupMember> {
    rollout: Rollout<GroupMember>;
    renderInlineVersionNumber: (versionNumber: number) => ReactNode;
    isValidVersionNumber?: (versionNumber: number) => boolean;
}

export interface EditRolloutViewComponentHandle<GroupMember> {
    show(rollout: Rollout<GroupMember>): void;
}

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

export function EditRolloutViewComponent<GroupMember>() {
    return forwardRef(
        (
            props: Props<GroupMember>,
            ref: ForwardedRef<EditRolloutViewComponentHandle<GroupMember>>,
        ) => {
            const rolloutNameInputRef = createRef<HTMLInputElement>();
            const versionNumberInputRef = createRef<HTMLInputElement>();
            const activatorTypeRef = createRef<DropDownList>();
            const versionSelectorTypeRef = createRef<DropDownList>();
            const timeRangeActivatorStartTimeInputRef =
                createRef<HTMLInputElement>();
            const timeRangeActivatorEndTimeInputRef =
                createRef<HTMLInputElement>();
            const percentageActivatorPercentageInputRef =
                createRef<HTMLInputElement>();
            const staticVersionSelectorVersionNumberInputRef =
                createRef<HTMLInputElement>();

            const [rollout, setRollout] = useState<Rollout<GroupMember>>(
                props.rollout,
            );
            const [rolloutName, setRolloutName] = useState<string>(
                props.rollout.name,
            );
            const [activatorType, setActivatorType] = useState<string>(
                props.rollout.activator.type,
            );
            const [versionSelectorType, setVersionSelectorType] =
                useState<string>(props.rollout.versionSelector.type);

            function getTimeRangeActivatorInput(rollout: Rollout<GroupMember>) {
                return rollout.activator.type === 'timeRange'
                    ? {
                          startTime: formatDate(rollout.activator.startAt),
                          endTime: formatDate(rollout.activator.endAt),
                      }
                    : undefined;
            }

            function getPercentageActivatorInput(
                rollout: Rollout<GroupMember>,
            ) {
                return rollout.activator.type === 'percentage'
                    ? {
                          percentage: rollout.activator.percentage,
                      }
                    : undefined;
            }

            function getStaticVersionSelectorInput(
                rollout: Rollout<GroupMember>,
            ) {
                return rollout.versionSelector.type === 'static'
                    ? {
                          versionNumber: rollout.versionSelector.versionNumber,
                      }
                    : undefined;
            }

            function getExperimentVersionSelectorInput(
                rollout: Rollout<GroupMember>,
            ) {
                return rollout.versionSelector.type === 'experiment'
                    ? {
                          versionNumbers:
                              rollout.versionSelector.versionNumbers,
                      }
                    : undefined;
            }

            const [timeRangeActivatorInput, setTimeRangeActivatorInput] =
                useState<TimeRangeActivatorInput | undefined>(
                    getTimeRangeActivatorInput(props.rollout),
                );
            const [percentageActivatorInput, setPercentageActivatorInput] =
                useState<PercentageActivatorInput | undefined>(
                    getPercentageActivatorInput(props.rollout),
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

            useImperativeHandle(ref, () => {
                return {
                    show(rollout: Rollout<GroupMember>) {
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
                        setStaticVersionSelectorInput(
                            getStaticVersionSelectorInput(rollout),
                        );
                        setExperimentVersionSelectorInput(
                            getExperimentVersionSelectorInput(rollout),
                        );
                        activatorTypeRef.current?.selectOption(
                            rollout.activator.type,
                        );
                        versionSelectorTypeRef.current?.selectOption(
                            rollout.versionSelector.type,
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
                setActivatorType(activatorType);
            };

            const onSelectVersionSelectorType = (
                versionSelectorType: string,
            ) => {
                setVersionSelectorType(versionSelectorType);
            };

            const onTimeRangeActivatorStartTimeChange = (
                event: React.ChangeEvent<HTMLInputElement>,
            ) => {
                setTimeRangeActivatorInput({
                    ...timeRangeActivatorInput,
                    startTime: event.target.value,
                });
            };

            const onTimeRangeActivatorEndTimeChange = (
                event: React.ChangeEvent<HTMLInputElement>,
            ) => {
                setTimeRangeActivatorInput({
                    ...timeRangeActivatorInput,
                    endTime: event.target.value,
                });
            };

            const onPercentageActivatorPercentageChange = (
                event: React.ChangeEvent<HTMLInputElement>,
            ) => {
                setPercentageActivatorInput({
                    percentage: Number(event.target.value),
                });
            };

            const onStaticVersionSelectorVersionNumberChange = (
                event: React.ChangeEvent<HTMLInputElement>,
            ) => {
                setStaticVersionSelectorInput({
                    versionNumber: Number(event.target.value),
                });
            };

            const onRemoveVersionNumberClickHandler = (
                versionNumber: number,
            ) => {
                return () => {
                    setExperimentVersionSelectorInput({
                        versionNumbers:
                            experimentVersionSelectorInput?.versionNumbers.filter(
                                (n) => n !== versionNumber,
                            ) ?? [],
                    });
                };
            };

            const onVersionNumberInputKeydown = (
                event: React.KeyboardEvent<HTMLInputElement>,
            ) => {
                if (event.key === 'Enter') {
                    const versionNumber = Number(
                        versionNumberInputRef.current?.value,
                    );
                    if (versionNumber) {
                        if (
                            props.isValidVersionNumber?.call(
                                null,
                                versionNumber,
                            )
                        ) {
                            if (
                                !experimentVersionSelectorInput?.versionNumbers.includes(
                                    versionNumber,
                                )
                            ) {
                                // TODO: update rollout at backend
                                setExperimentVersionSelectorInput({
                                    versionNumbers: [
                                        ...(experimentVersionSelectorInput?.versionNumbers ??
                                            []),
                                        versionNumber,
                                    ],
                                });
                            }
                        }
                    }

                    versionNumberInputRef.current!.value = '';
                }
            };

            const renderActivatorDetailSection = () => {
                switch (activatorType) {
                    case 'static':
                        break;
                    case 'timeRange':
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
                                            timeRangeActivatorInput?.startTime
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
                                        ref={timeRangeActivatorEndTimeInputRef}
                                        type={'text'}
                                        className={styles.TextField}
                                        value={timeRangeActivatorInput?.endTime}
                                        placeholder={'YYYY/MM/DD HH:MM:SS'}
                                        onChange={
                                            onTimeRangeActivatorEndTimeChange
                                        }
                                    />
                                </div>
                            </div>
                        );
                    case 'percentage':
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
                                        ref={
                                            percentageActivatorPercentageInputRef
                                        }
                                        type={'text'}
                                        className={styles.TextField}
                                        value={
                                            percentageActivatorInput?.percentage
                                        }
                                        placeholder={'0-100'}
                                        onChange={
                                            onPercentageActivatorPercentageChange
                                        }
                                    />
                                </div>
                            </div>
                        );
                }
            };

            const renderVersionSelectorDetailSection = () => {
                switch (versionSelectorType) {
                    case 'static':
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
                                            staticVersionSelectorInput?.versionNumber
                                        }
                                        onChange={
                                            onStaticVersionSelectorVersionNumberChange
                                        }
                                    />
                                </div>
                            </div>
                        );
                    case 'experiment':
                        return (
                            <div className={styles.Section}>
                                <div className={`${styles.Row}`}>
                                    <div
                                        className={`${styles.Label} ${styles.NextRow}`}
                                    >
                                        Version Numbers:
                                    </div>
                                    <div className={styles.ItemList}>
                                        {experimentVersionSelectorInput?.versionNumbers.map(
                                            (versionNumber) => {
                                                return (
                                                    <div
                                                        key={versionNumber}
                                                        className={styles.Item}
                                                    >
                                                        {props.renderInlineVersionNumber(
                                                            versionNumber,
                                                        )}
                                                        <div
                                                            className={
                                                                styles.Remove
                                                            }
                                                            onClick={onRemoveVersionNumberClickHandler(
                                                                versionNumber,
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
                                            ref={versionNumberInputRef}
                                            type={'text'}
                                            className={styles.Input}
                                            placeholder={`Enter version number`}
                                            autoComplete={'off'}
                                            data-1p-ignore={true}
                                            onKeyDown={
                                                onVersionNumberInputKeydown
                                            }
                                        />
                                    </div>
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
        },
    );
}

function formatDate(date: Date | undefined): string {
    return date ? moment(date).format('MM/DD/YYYY h:mm:ss') : '';
}
