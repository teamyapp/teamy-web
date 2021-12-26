import React, { Component, createRef } from 'react';
import { Deps } from '../../../deps';
import Team from '../../../entity/team';
import { ButtonUI } from '../../../ui/view/Button';
import { MaterialIconUI } from '../../../ui/view/MaterialIcon';
import { ModalUI } from '../../../ui/view/Modal';
import { TextAreaUI } from '../../../ui/view/TextArea';

import styles from './AddTeamMembersModal.component.module.scss';

const itemSeparator = ',';

interface IProps {
    deps: Deps;
    onTeamMembersAdded?: (teamId: number) => void;
}

interface IState {
    team?: Team;
}

export class AddTeamMembersModalComponent extends Component<IProps, IState> {
    private modalRef = createRef<ModalUI>();
    private userIDTextAreaRef = createRef<TextAreaUI>();

    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    public render() {
        return (
            <ModalUI ref={this.modalRef} level={1}>
                <div className={styles.Header}>
                    Add New Members to {this.state.team?.name}
                    <div
                        className={styles.CloseButton}
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.UserIds}>
                        <TextAreaUI
                            ref={this.userIDTextAreaRef}
                            label={'User IDs'}
                            placeholder={`Separated by '${itemSeparator}'`}
                        />
                    </div>
                    <div className={styles.AddAction}>
                        <ButtonUI
                            label={'Add'}
                            onClick={this.onAddButtonClick}
                        />
                    </div>
                </div>
            </ModalUI>
        );
    }

    public open = async (teamId: number) => {
        const team = await this.props.deps.teamService.fetchTeam(teamId);
        this.setState({
            team,
        });
        this.modalRef.current?.open();
    };

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private onAddButtonClick = async () => {
        const teamId = this.state.team!.id;
        const userIdsString = this.userIDTextAreaRef.current?.content || '';
        const userIds = userIdsString
            .split(itemSeparator)
            .map((idString: string) => parseInt(idString));
        await Promise.all(
            userIds.map((userId: number) =>
                this.props.deps.teamService.addTeamMember(teamId, userId),
            ),
        );
        this.modalRef.current?.close();
        this.props.onTeamMembersAdded?.call(null, teamId);
    };
}
