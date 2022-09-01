import React, { Component, ReactNode, createRef } from 'react';
import { RelativeLayout } from '@lib/layout/relativeLayout';
import { ButtonUI } from '@lib/ui/Button';
import { SpacerUI } from '@lib/ui/Spacer';
import { TextFieldUI } from '@lib/ui/TextField';

import { Duration } from '@core/entity/duration';

import styles from './DurationInput.ui.module.scss';
import { PopupContainerUI } from './PopupContainer';

interface Props {
    relativeLayout: RelativeLayout;
    zOffset?: number;
    duration?: Duration;
    onPopupOpen?: () => void;
    onPopupClose?: () => void;
    onDurationChange?: (duration?: Duration) => void;
    icon?: ReactNode;
}

export class DurationInputUI extends Component<Props> {

    render() {
        const { duration } = this.props;
        return (
            <div className={styles.Duration}>
                <PopupContainerUI
                    overSpaceAction="jumpVertically"
                    onOpen={this.props.onPopupOpen}
                    onClose={this.props.onPopupClose}
                    relativeLayout={this.props.relativeLayout}
                    zOffset={this.props.zOffset}
                    trigger={({ onToggle }) => (
                        <div
                            className={styles.ValueRow}
                            onClick={onToggle}
                        >
                            {this.props.icon}
                            {duration && (
                                <div className={styles.Value}>
                                    {this.renderDuration()}
                                </div>
                            )}
                        </div>
                    )}
                    target={({ onClose }) => (
                        <DurationInputPopup
                            duration={duration}
                            onDurationChange={this.props.onDurationChange}
                            onClose={onClose}
                        />
                    )}
                />
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

}

function tryIncludeUnit(buffer: string[], count: number, unit: string) {
    if (count > 0) {
        buffer.push(`${count}${unit}`);
    }
}

interface PopupProps {
    duration?: Duration;
    onDurationChange?: (duration?: Duration) => void;
    onClose?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export class DurationInputPopup extends Component<PopupProps> {
    private readonly yearsInputRef = createRef<TextFieldUI>();
    private readonly monthsInputRef = createRef<TextFieldUI>();
    private readonly weeksInputRef = createRef<TextFieldUI>();
    private readonly daysInputRef = createRef<TextFieldUI>();
    private readonly hoursInputRef = createRef<TextFieldUI>();
    private readonly minutesInputRef = createRef<TextFieldUI>();

    render() {
        const { duration } = this.props;

        return (
            <div
                className={`${styles.InputPopup}`}
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
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
                    <div className={`${styles.Button} ${styles.SaveButton}`}>
                        <ButtonUI label={'Save'} onClick={this.onSaveClick} />
                    </div>
                    <div className={`${styles.Button} ${styles.ClearButton}`}>
                        <ButtonUI label={'Clear'} onClick={this.onClearClick} />
                    </div>
                </div>
            </div>
        );
    }

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

        this.props.onClose?.call(null);
    };

    private onClearClick = () => {
        this.props.onDurationChange?.(undefined);
        this.props.onClose?.call(null);
    };
}
