import React, { Component, ReactNode, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { SpacerUI } from '@lib/ui/Spacer';
import { TextFieldUI } from '@lib/ui/TextField';

import { Duration } from '@core/entity/duration';

import styles from './DurationInput.ui.module.scss';

interface Props {
    duration?: Duration;
    onPopupOpen?: () => void;
    onPopupClose?: () => void;
    onDurationChange?: (duration?: Duration) => void;
    icon?: ReactNode;
}

interface State {
    showPopup: boolean;
}

export class DurationInputUI extends Component<Props, State> {
    private readonly durationRef = createRef<HTMLDivElement>();
    private readonly valueRowRef = createRef<HTMLDivElement>();
    private readonly popupRef = createRef<HTMLDivElement>();
    private readonly yearsInputRef = createRef<TextFieldUI>();
    private readonly monthsInputRef = createRef<TextFieldUI>();
    private readonly weeksInputRef = createRef<TextFieldUI>();
    private readonly daysInputRef = createRef<TextFieldUI>();
    private readonly hoursInputRef = createRef<TextFieldUI>();
    private readonly minutesInputRef = createRef<TextFieldUI>();
    private insidePopup = false;

    constructor(props: Props) {
        super(props);
        this.state = {
            showPopup: false,
        };
    }

    render() {
        const { duration } = this.props;
        return (
            <div
                tabIndex={-1}
                ref={this.durationRef}
                className={styles.Duration}
                onBlur={this.onDurationBlur}
            >
                <div
                    className={styles.ValueRow}
                    ref={this.valueRowRef}
                    onClick={this.onValueRowClick}
                >
                    {this.props.icon}
                    {duration && (
                        <div className={styles.Value}>
                            {this.renderDuration()}
                        </div>
                    )}
                </div>
                {this.state.showPopup && (
                    <div
                        ref={this.popupRef}
                        className={`${styles.InputPopup}`}
                        onMouseEnter={this.onMouseEnterPopup}
                        onMouseLeave={this.onMouseLeavePopup}
                    >
                        <div className={styles.InputRow}>
                            <div className={styles.TextField}>
                                <TextFieldUI
                                    ref={this.yearsInputRef}
                                    label={'Years'}
                                    value={`${duration?.years || 0}`}
                                />
                            </div>
                            <SpacerUI />
                            <div className={styles.TextField}>
                                <TextFieldUI
                                    ref={this.monthsInputRef}
                                    label={'Months'}
                                    value={`${duration?.months || 0}`}
                                />
                            </div>
                            <SpacerUI />
                            <div className={styles.TextField}>
                                <TextFieldUI
                                    ref={this.weeksInputRef}
                                    label={'Weeks'}
                                    value={`${duration?.weeks || 0}`}
                                />
                            </div>
                        </div>
                        <div className={styles.InputRow}>
                            <div className={styles.TextField}>
                                <TextFieldUI
                                    ref={this.daysInputRef}
                                    label={'Days'}
                                    value={`${duration?.days || 0}`}
                                />
                            </div>
                            <SpacerUI />
                            <div className={styles.TextField}>
                                <TextFieldUI
                                    ref={this.hoursInputRef}
                                    label={'Hours'}
                                    value={`${duration?.hours || 0}`}
                                />
                            </div>
                            <SpacerUI />
                            <div className={styles.TextField}>
                                <TextFieldUI
                                    ref={this.minutesInputRef}
                                    label={'Minutes'}
                                    value={`${duration?.minutes || 0}`}
                                />
                            </div>
                        </div>
                        <div className={styles.InputRow}>
                            <div
                                className={`${styles.Button} ${styles.SaveButton}`}
                            >
                                <ButtonUI
                                    label={'Save'}
                                    onClick={this.onSaveClick}
                                />
                            </div>
                            <div
                                className={`${styles.Button} ${styles.ClearButton}`}
                            >
                                <ButtonUI
                                    label={'Clear'}
                                    onClick={this.onClearClick}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    renderDuration() {
        const { duration } = this.props;
        const buffer: string[] = [];
        tryIncludeUnit(buffer, duration?.years || 0, 'y');
        tryIncludeUnit(buffer, duration?.months || 0, 'mo');
        tryIncludeUnit(buffer, duration?.weeks || 0, 'w');
        tryIncludeUnit(buffer, duration?.days || 0, 'd');
        tryIncludeUnit(buffer, duration?.hours || 0, 'h');
        tryIncludeUnit(buffer, duration?.minutes || 0, 'min');
        tryIncludeUnit(buffer, duration?.seconds || 0, 's');
        return buffer.join(' ');
    }

    onValueRowClick = () => {
        if (!this.valueRowRef.current) {
            return;
        }

        this.setState(
            {
                showPopup: !this.state.showPopup,
            },
            () => {
                if (this.state.showPopup) {
                    this.durationRef.current?.focus();
                    this.props.onPopupOpen?.call(null);
                } else {
                    this.closePopup();
                }
            },
        );
    };

    private onSaveClick = () => {
        const duration = Duration.fromJson({
            years: parseInt(this.yearsInputRef.current?.value || '0'),
            months: parseInt(this.monthsInputRef.current?.value || '0'),
            weeks: parseInt(this.weeksInputRef.current?.value || '0'),
            days: parseInt(this.daysInputRef.current?.value || '0'),
            hours: parseInt(this.hoursInputRef.current?.value || '0'),
            minutes: parseInt(this.minutesInputRef.current?.value || '0'),
        });
        if (duration.totalMilliSeconds > 0) {
            this.props.onDurationChange?.(duration);
        } else {
            this.props.onDurationChange?.(undefined);
        }

        this.closePopup();
    };

    private onClearClick = () => {
        this.props.onDurationChange?.(undefined);
        this.closePopup();
    };

    private closePopup = () => {
        this.setState({
            showPopup: false,
        });
        this.insidePopup = false;
        this.props.onPopupClose?.call(null);
    };

    private onDurationBlur = () => {
        if (this.insidePopup) {
            return;
        }

        this.closePopup();
    };

    private onMouseEnterPopup = () => {
        this.insidePopup = true;
    };

    private onMouseLeavePopup = () => {
        this.durationRef.current?.focus();
        this.insidePopup = false;
    };
}

function tryIncludeUnit(buffer: string[], count: number, unit: string) {
    if (count > 0) {
        buffer.push(`${count}${unit}`);
    }
}
