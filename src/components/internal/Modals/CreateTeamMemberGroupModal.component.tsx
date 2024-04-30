import { ModalUI } from '@lib/ui/Modal';
import {
    FC,
    ForwardedRef,
    RefAttributes,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TextFieldUI } from '@lib/ui/TextField';
import { ButtonUI } from '@lib/ui/Button';
import { CreateTeamMemberGroupInput } from '@core/entity/input';
import { Deps } from '@core/dep/deps';
import styles from './CreateTeamMemberGroupModal.component.module.scss';

interface Props {
    deps: Deps;
}

export interface CreateTeamModalComponentHandle {
    open: () => void;
}

export const CreateTeamMemberGroupModalComponent: FC<
    Props & RefAttributes<CreateTeamModalComponentHandle>
> = forwardRef((props, ref: ForwardedRef<CreateTeamModalComponentHandle>) => {
    const [createTeamMemberGroupInput, setCreateTeamMemberGroupInput] =
        useState<CreateTeamMemberGroupInput>();
    const nameInputRef = useRef<TextFieldUI>(null);
    const modalRef = useRef<ModalUI>(null);
    const open = () => {
        setCreateTeamMemberGroupInput({
            name: '',
        });
        nameInputRef.current?.focus();
        modalRef.current?.open();
    };

    useImperativeHandle(ref, () => ({
        open,
    }));

    const onTeamMemberGroupNameChange = (name: string) => {
        setCreateTeamMemberGroupInput({
            ...createTeamMemberGroupInput,
            name,
        });
    };

    const onCreateClick = () => {
        const team = props.deps.graphSource.currentTeam();
        if (!team) {
            return;
        }

        if (!createTeamMemberGroupInput) {
            return;
        }

        props.deps.stateSyncer.createTeamMemberGroup(
            team.id,
            createTeamMemberGroupInput,
        );

        setCreateTeamMemberGroupInput(undefined);
        modalRef.current?.close();
    };

    const onCloseButtonClick = () => {
        setCreateTeamMemberGroupInput(undefined);
        modalRef.current?.close();
    };

    return (
        <ModalUI ref={modalRef} level={2}>
            <div className={styles.Header}>
                Create Sprint
                <div
                    className={styles.CloseButton}
                    onClick={onCloseButtonClick}
                >
                    <MaterialIconUI>cancel</MaterialIconUI>
                </div>
            </div>
            <div className={styles.Content}>
                <div className={styles.TeamMemberGroupName}>
                    <TextFieldUI
                        ref={nameInputRef}
                        value={createTeamMemberGroupInput?.name}
                        label={'Name'}
                        onChange={onTeamMemberGroupNameChange}
                    />
                </div>
                <div className={styles.CreateAction}>
                    <ButtonUI label={'Create'} onClick={onCreateClick} />
                </div>
            </div>
        </ModalUI>
    );
});
