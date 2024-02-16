import moment from 'moment/moment';
import React, { ChangeEvent, createRef, useEffect } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';

import { getUserShortName } from '../../../../internal/format';
import { CreateAppSecretModalComponent } from '../CreateAppSecretModal.component';
import styles from './CredentialTab.component.module.scss';
import { AppSecret } from '@core/entity/appSecret';

interface ApiSecretInput {
    name: string;
    token?: string;
}

interface Props {
    deps: Deps;
    appId: number;
}

export function CredentialTabComponent(props: Props) {
    const createAppSecretModalRef = createRef<CreateAppSecretModalComponent>();
    const feedbackPubSub = props.deps.feedbackPubSub;
    const app = props.deps.graphSource.app(props.appId);
    const tmpApiSecretInputs = () => {
        const tmpApiSecretInputs: Record<number, ApiSecretInput> = {};
        app?.secrets.forEach((secret) => {
            tmpApiSecretInputs[secret.id] = {
                name: secret.name,
                token: secret.token,
            };
        });
        return tmpApiSecretInputs;
    };

    const [apiSecretInputs, setApiSecretInputs] =
        React.useState<Record<number, ApiSecretInput>>(tmpApiSecretInputs);

    useEffect(() => {
        const stateChangeChan = props.deps.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log(
                    '[CredentialTabComponent] waiting for state changes',
                );
                const hasChanged = await stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                setApiSecretInputs(tmpApiSecretInputs);
            }
        })().then();

        return () => {
            stateChangeChan?.close();
        };
    }, []);

    const onCreateSecretClick = () => {
        createAppSecretModalRef.current?.open();
    };

    const onApiSecretNameChangeHandler = (apiSecretId: number) => {
        return (event: ChangeEvent<HTMLInputElement>) => {
            setApiSecretInputs({
                ...apiSecretInputs,
                [apiSecretId]: {
                    name: event.target.value,
                },
            });
        };
    };

    const onCopySecretClickHandler = (secret: AppSecret) => {
        return async () => {
            if (!secret.token) {
                return;
            }

            navigator.clipboard.writeText(secret.token!);

            await feedbackPubSub.publish({
                type: 'AppSecretCopied',
                appSecretId: secret.id,
            });
        };
    };

    const onSaveSecretClickHandler = (apiSecretId: number) => {
        return async () => {
            props.deps.stateSyncer.updateAppSecret(
                apiSecretId,
                {
                    name: apiSecretInputs[apiSecretId].name,
                }
            )
        };
    };

    const onDeleteSecretClickHandler = (apiSecretId: number) => {
        return () => {
            props.deps.stateSyncer.deleteAppSecret(props.appId, apiSecretId);
        };
    };

    return (
        <>
            <div className={styles.CredentialTab}>
                <div className={styles.Section}>
                    <div className={styles.Row}>
                        <span className={`${styles.Label} ${styles.SameRow}`}>
                            App ID:
                        </span>
                        {props.appId}
                    </div>
                </div>
                <div className={styles.Section}>
                    <div className={styles.TitleRow}>
                        <div className={styles.Title}>API Secrets</div>
                        <div className={styles.Spacer} />
                        <div className={styles.Actions}>
                            <div
                                className={`${styles.Action} ${styles.CreateSecret}`}
                                onClick={onCreateSecretClick}
                            >
                                Create secret
                            </div>
                        </div>
                    </div>
                    <table className={`${styles.Table} ${styles.Secret}`}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th className={styles.Name}>Name</th>
                                <th>Added at</th>
                                <th>Added by</th>
                                <th>Last used</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {app?.secrets.map((secret) => (
                                <tr
                                    key={secret.id}
                                    className={styles.SecretRow}
                                >
                                    <td>{secret.id}</td>
                                    <td className={styles.Name}>
                                        <input
                                            type={'text'}
                                            className={styles.TextField}
                                            value={
                                                apiSecretInputs[secret.id].name
                                            }
                                            onChange={onApiSecretNameChangeHandler(
                                                secret.id,
                                            )}
                                        />
                                    </td>
                                    <td>{moment(secret.addedAt).fromNow()}</td>
                                    <td>
                                        {getUserShortName(
                                            secret.addedBy.firstName,
                                            secret.addedBy.lastName,
                                        )}
                                    </td>
                                    <td>
                                        {secret.lastUsedAt
                                            ? moment(
                                                  secret.lastUsedAt,
                                              ).fromNow()
                                            : 'Never'}
                                    </td>
                                    <td className={styles.Actions}>
                                        {secret.token && (<div
                                            className={`${styles.RowAction} ${styles.Copy}`}
                                            onClick={onCopySecretClickHandler(
                                                secret,
                                            )}
                                        >
                                            <MaterialIconUI
                                                iconStyle={'outlined'}
                                            >
                                                content_copy
                                            </MaterialIconUI>
                                        </div>)}
                                        <div
                                            className={`${styles.RowAction} ${styles.Save}`}
                                            onClick={onSaveSecretClickHandler(
                                                secret.id,
                                            )}
                                        >
                                            <MaterialIconUI
                                                iconStyle={'outlined'}
                                            >
                                                save
                                            </MaterialIconUI>
                                        </div>
                                        <div
                                            className={`${styles.RowAction} ${styles.Delete}`}
                                            onClick={onDeleteSecretClickHandler(
                                                secret.id,
                                            )}
                                        >
                                            <MaterialIconUI
                                                iconStyle={'outlined'}
                                            >
                                                remove_circle
                                            </MaterialIconUI>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <CreateAppSecretModalComponent
                deps={props.deps}
                ref={createAppSecretModalRef}
                appId={props.appId}
            />
        </>
    );
}
