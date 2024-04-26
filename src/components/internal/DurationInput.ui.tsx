import React, { Component, ReactNode, createRef, MouseEvent } from 'react';

import { RelativeLayout, RelativeLayoutContainerUI } from '@lib/layout';
import { Duration } from '@lib/time/duration';
import { ButtonUI } from '@lib/ui/Button';
import { SpacerUI } from '@lib/ui/Spacer';
import { TextFieldUI } from '@lib/ui/TextField';

import styles from './DurationInput.ui.module.scss';

interface Props {
    relativeLayout: RelativeLayout;
    zOffset?: number;
    duration?: Duration;
    canClear?: boolean;
    icon?: ReactNode;
    onPopupOpen?: () => void;
    onPopupClose?: () => void;
    onDurationChange?: (duration?: Duration) => void;
    transformReferenceContainer?: (props: {
        showFollower: boolean;
        container: ReactNode;
    }) => ReactNode;
}

export class DurationInputUI extends Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const { duration } = this.props;
        return (
            <div className={styles.Duration}>
                <RelativeLayoutContainerUI
                    overSpaceAction='jumpVertically'
                    onOpenContainer={this.props.onPopupOpen}
                    relativeLayout={this.props.relativeLayout}
                    referenceOffset={4}
                    preserveReferenceParentHeight={true}
                    zOffset={this.props.zOffset}
                    renderReferenceElement={({ toggleContainer, showFollower }) => (
                        this.props.transformReferenceContainer? this.props.transformReferenceContainer({
                            showFollower,
                            container: this.renderReferenceElement({duration, toggleContainer}),
                        }) : this.renderReferenceElement({duration, toggleContainer})
                    )}
                    renderFollower={({ closeContainer }) => (
                        <DurationInputPopup
                            duration={duration}
                            canClear={this.props.canClear}
                            onDurationChange={this.props.onDurationChange}
                            onClose={closeContainer}
                        />
                    )}
                />
            </div>
        );
    }

    renderReferenceElement = ({ duration, toggleContainer }: {
        duration?: Duration,
        toggleContainer: ()=>void
    }) => {
        return <div className={styles.ValueRow}
             onClick={this.onViewRowClickHandler(toggleContainer)}>
            {this.props.icon}
            {duration && (
                <div className={styles.Value}>
                    {this.props.duration?.toReadable()}
                </div>
            )}
        </div>;
    }

    onViewRowClickHandler = (toggleContainer: () => void) => {
        return (event: MouseEvent) => {
            event.stopPropagation();
            toggleContainer();
        };
    };
}

interface PopupProps {
    duration?: Duration;
    canClear?: boolean;
    onDurationChange?: (duration?: Duration) => void;
    onClose?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export class DurationInputPopup extends Component<PopupProps, any> {
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
                    {this.props.canClear && (
                        <div
                            className={`${styles.Button} ${styles.ClearButton}`}
                        >
                            <ButtonUI
                                label={'Clear'}
                                onClick={this.onClearClick}
                            />
                        </div>
                    )}
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
