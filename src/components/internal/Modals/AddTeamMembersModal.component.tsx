import moment from 'moment';
import React, { Component, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DropDownList, Option } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextAreaUI } from '@lib/ui/TextArea';
import { TextFieldUI } from '@lib/ui/TextField';

import { invitationLink } from '@core/config/routing';
import { Deps } from '@core/dep/deps';
import { Team } from '@core/entity/team';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './AddTeamMembersModal.component.module.scss';

const expirationPeriodOptions: Option[] = [
    {
        key: 'P7D',
        description: '1 Week',
    },
    {
        key: 'P1D',
        description: '1 Day',
    },
];

interface Props {
    deps: Deps;
    onTeamMembersAdded?: (teamId: number) => void;
}

interface State {
    team?: Team;
    invitationLink?: string;
    currentTabIndex: number;
}

export class AddTeamMembersModalComponent extends Component<Props, State> {
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;

    private readonly modalRef = createRef<ModalUI>();
    private readonly userIDTextAreaRef = createRef<TextAreaUI>();
    private readonly firstNameTextFieldRef = createRef<TextFieldUI>();
    private readonly lastNameTextFieldRef = createRef<TextFieldUI>();
    private readonly dropDownListRef = createRef<DropDownList>();

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {
            currentTabIndex: 0,
        };
    }

    public render() {
        return (
            <ModalUI ref={this.modalRef} level={1}>
                <div className={styles.Header}>
                    Invite New Member to {this.state.team?.name}
                    <div
                        className={styles.CloseButton}
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.Section}>
                        <div className={styles.FirstName}>
                            <TextFieldUI
                                label={'First Name'}
                                ref={this.firstNameTextFieldRef}
                            />
                        </div>
                        <div className={styles.LastName}>
                            <TextFieldUI
                                label={'Last Name'}
                                ref={this.lastNameTextFieldRef}
                            />
                        </div>
                        <div className={styles.ExpirationPeriod}>
                            <div className={styles.Label}>Expire In:</div>
                            <div className={styles.DropDown}>
                                <DropDownList
                                    ref={this.dropDownListRef}
                                    selectOptionKey={
                                        expirationPeriodOptions[0].key
                                    }
                                    options={expirationPeriodOptions}
                                />
                            </div>
                        </div>
                        <div className={styles.GenerateLinkAction}>
                            <ButtonUI
                                label={'Get Invitation Link'}
                                onClick={this.onGenerateLinkClick}
                            />
                        </div>
                        {this.state.invitationLink && (
                            <div className={styles.InvitationLink}>
                                {this.state.invitationLink}
                            </div>
                        )}
                    </div>
                </div>
            </ModalUI>
        );
    }

    public open = async (teamId: number, defaultTabIndex: number = 0) => {
        const team = await this.graphSource.team(teamId);
        this.setState({
            currentTabIndex: defaultTabIndex,
            invitationLink: undefined,
            team,
        });
        this.modalRef.current?.open();
    };

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private onGenerateLinkClick = async () => {
        const firstName = this.firstNameTextFieldRef.current?.value;
        const lastName = this.lastNameTextFieldRef.current?.value;
        const expirationPeriod =
            this.dropDownListRef.current?.value ||
            expirationPeriodOptions[0].key;
        const expireAt = moment().add(moment.duration(expirationPeriod));
        const [invitationId, invitationCode] =
            await this.stateSyncer.createInvitation(this.state.team!.id, {
                receiverFirstName: firstName || '',
                receiverLastName: lastName || '',
                expireAt: expireAt.toDate(),
            });
        if (!invitationId || !invitationCode) {
            return;
        }

        this.setState({
            invitationLink: invitationLink(invitationId, invitationCode),
        });
    };
}
