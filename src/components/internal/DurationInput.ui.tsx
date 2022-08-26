import React, { Component, ReactNode, createRef } from 'react';
import { createPortal } from 'react-dom';

import { LayoutAttachment, RelativeLayout } from '@lib/layout/relativeLayout';
import { ButtonUI } from '@lib/ui/Button';
import { SpacerUI } from '@lib/ui/Spacer';
import { TextFieldUI } from '@lib/ui/TextField';

import { Duration } from '@core/entity/duration';

import styles from './DurationInput.ui.module.scss';

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
    private readonly valueRowRef = createRef<HTMLDivElement>();
    private readonly popupRef = createRef<DurationInputPopup>();
    private insidePopup = false;
    private showPopup = false;
    private readonly popupContainer = document.createElement('div');

    componentDidMount() {
        document.body.appendChild(this.popupContainer);
    }

    componentWillUnmount() {
        document.body.removeChild(this.popupContainer);
    }

    render() {
        const { duration } = this.props;
        return (
            <div className={styles.Duration}>
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
                <DurationInputPopup
                    container={this.popupContainer!}
                    ref={this.popupRef}
                    duration={duration}
                    relativeLayout={this.props.relativeLayout}
                    zOffset={(this.props.zOffset || 0) + 1}
                    onDurationChange={this.props.onDurationChange}
                    onMouseEnter={this.onPopupEnter}
                    onMouseLeave={this.onPopupLeave}
                    onOpen={this.props.onPopupOpen}
                    onClose={this.onPopupClose}
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

    onValueRowClick = () => {
        if (!this.valueRowRef.current) {
            return;
        }

        this.showPopup = !this.showPopup;
        if (this.showPopup) {
            if (this.valueRowRef.current) {
                this.popupRef.current?.open(this.valueRowRef.current);
            }
        } else {
            this.closePopup();
        }
    };

    private closePopup = () => {
        this.popupRef.current?.close();
    };

    private onPopupEnter = () => {
        this.insidePopup = true;
    };

    private onPopupLeave = () => {
        this.insidePopup = false;
    };

    private onPopupClose = () => {
        this.showPopup = false;
        this.insidePopup = false;
        this.props.onPopupClose?.call(null);
    };
}

function tryIncludeUnit(buffer: string[], count: number, unit: string) {
    if (count > 0) {
        buffer.push(`${count}${unit}`);
    }
}

interface PopupProps {
    container: HTMLElement;
    relativeLayout: RelativeLayout;
    zOffset: number;
    duration?: Duration;
    onDurationChange?: (duration?: Duration) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

interface PopupState {
    showPopup: boolean;
}

export class DurationInputPopup extends Component<PopupProps, PopupState> {
    private layoutAttachment?: LayoutAttachment;
    private readonly yearsInputRef = createRef<TextFieldUI>();
    private readonly monthsInputRef = createRef<TextFieldUI>();
    private readonly weeksInputRef = createRef<TextFieldUI>();
    private readonly daysInputRef = createRef<TextFieldUI>();
    private readonly hoursInputRef = createRef<TextFieldUI>();
    private readonly minutesInputRef = createRef<TextFieldUI>();
    private readonly popupRef = createRef<HTMLDivElement>();

    constructor(props: PopupProps) {
        super(props);
        this.state = {
            showPopup: false,
        };
    }

    render() {
        const { duration } = this.props;
        return createPortal(
            this.state.showPopup && (
                <div
                    ref={this.popupRef}
                    className={`${styles.InputPopup}`}
                    style={{
                        zIndex: this.props.zOffset || 0,
                    }}
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
            ),
            this.props.container,
        );
    }

    public open(refElement: HTMLElement) {
        this.setState(
            {
                showPopup: true,
            },
            () => {
                if (this.popupRef.current) {
                    this.layoutAttachment =
                        this.props.relativeLayout.attachElements(
                            refElement,
                            this.popupRef.current,
                            'center',
                            'bottom',
                        );
                }
            },
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

        this.close();
    };

    private onClearClick = () => {
        this.props.onDurationChange?.(undefined);
        this.close();
    };

    public close = () => {
        this.layoutAttachment?.detach();
        this.setState({
            showPopup: false,
        });

        this.props.onClose?.call(null);
        this.props.onMouseLeave?.call(null);
    };
}
