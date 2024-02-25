import classNames from 'classnames';
import moment from 'moment/moment';
import React, {
    ChangeEvent,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { LinkButtonUI } from '@lib/ui/LinkButton';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { AppVersion } from '@core/entity/appVersion';

import styles from './VersionsTab.component.module.scss';

const APP_VERSION_ICON_SIZE = 100;
interface Props {
    onCreateVersionClick: () => Promise<number>;
    onDeleteVersionClick: (versionNumber: number) => void;
    appId: number;
    deps: Deps;
}

export function VersionsTabComponent(props: Props) {
    const selectedAppVersionMutRef = useRef<AppVersion>();
    const [selectedAppVersion, setSelectedAppVersion] = useState<AppVersion>();
    const [uploadProgress, setUploadProgress] = useState({
        newBytesUploaded: 0,
        totalPercentage: 0,
    });

    useEffect(() => {
        const stateChangeChan = props.deps.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('[VersionsTabComponent] waiting for state changes');
                const hasChanged = await stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                if (selectedAppVersionMutRef.current) {
                    const app = props.deps.graphSource.app(props.appId);
                    const appVersion = app?.versions.find(
                        (appVersion) =>
                            appVersion.number === selectedAppVersionMutRef.current?.number,
                    );

                    selectedAppVersionMutRef.current = appVersion;
                    setSelectedAppVersion(appVersion);
                }
            }
        })().then();

        return () => {
            stateChangeChan?.close();
        };
    }, []);

    const handleUploadAppPackageErrorTabBackClick = () => {
        if (!selectedAppVersion) {
            return;
        }

        props.deps.stateSyncer.updateAppVersion(
            props.appId,
            selectedAppVersion.number,
            {
                status: 'INIT',
            },
        );
    };

    const updateSelectedAppVersion = (appVersion?: AppVersion) => {
        selectedAppVersionMutRef.current = appVersion;
        setSelectedAppVersion(appVersion);
    }

    const onCreateVersionClick = async () => {
        const versionNumber = await props.onCreateVersionClick();
        const app = props.deps.graphSource.app(props.appId);
        const appVersion = app?.versions.find(
            (appVersion) => appVersion.number === versionNumber,
        );

        updateSelectedAppVersion(appVersion);
    };

    const handleAppVersionFileChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        if (!selectedAppVersion) {
            return;
        }

        const files = event.target.files;
        if (!files || files.length < 1) {
            return;
        }

        const file = files[0];
        const fileUploadSessionId =
            await props.deps.stateSyncer.createAppPackageUploadSession(
                selectedAppVersion.app.id,
                selectedAppVersion.number,
            );

        setUploadProgress({
            newBytesUploaded: 0,
            totalPercentage: 0,
        });

        const uploadSession =
            props.deps.fileUploadSessionFactory.createFileUploadSession(
                fileUploadSessionId,
            );
        const onNewProgressCh = uploadSession.subscribeNewProgress();
        (async () => {
            while (true) {
                const progress = await onNewProgressCh.pop();
                if (progress === undefined) {
                    return;
                }

                setUploadProgress(progress);
            }
        })().then();
        const error = await uploadSession.uploadFile(file);
        if (error) {
            alert('Fail to upload file');
        }
        await props.deps.stateSyncer.finishAppPackageUploadSession(
            selectedAppVersion.app.id,
            selectedAppVersion.number,
            fileUploadSessionId,
        );
    };

    const onVersionNumberClickHandler = (appVersion: AppVersion) => {
        return () => {
            updateSelectedAppVersion(appVersion);
        };
    };

    const onDeleteVersionClick = () => {
        if (!selectedAppVersion) {
            return;
        }

        props.onDeleteVersionClick(selectedAppVersion.number);
    };

    const renderSelectingAppPackageTab = (): ReactNode => {
        if (!selectedAppVersion) {
            return;
        }

        return (
            <>
                <div className={styles.Title}>Upload App Package</div>
                <div className={`${styles.Button} ${styles.SelectFile}`}>
                    <div className={styles.Icon}>
                        <MaterialIconUI>upload_file</MaterialIconUI>
                    </div>
                    <input
                        type={'file'}
                        className={styles.FileInput}
                        onChange={handleAppVersionFileChange}
                    />
                </div>
                <div className={`${styles.Row} ${styles.Buttons}`}>
                    {!selectedAppVersion.locked && (
                        <div
                            className={styles.Delete}
                            onClick={onDeleteVersionClick}
                        >
                            <ButtonUI label={'Delete'} />
                        </div>
                    )}
                </div>
            </>
        );
    };

    const renderUploadAppPackageErrorTab = (
        errorMessage?: string,
    ): ReactNode => {
        if (!selectedAppVersion) {
            return;
        }

        return (
            <>
                <div className={`${styles.Title} ${styles.TitleError}`}>
                    <div>Failed to Upload App Package</div>
                    <div>Try again</div>
                </div>
                <div className={styles.ErrorMessage}>{errorMessage}</div>
                <div className={`${styles.Row} ${styles.Buttons}`}>
                    <div className={styles.Download}>
                        <ButtonUI
                            label={'Back'}
                            onClick={handleUploadAppPackageErrorTabBackClick}
                        />
                    </div>
                    {!selectedAppVersion.locked && (
                        <div
                            className={styles.Delete}
                            onClick={onDeleteVersionClick}
                        >
                            <ButtonUI label={'Delete'} />
                        </div>
                    )}
                </div>
            </>
        );
    };

    const renderUploadingAppPackageTab = (): ReactNode => {
        return (
            <>
                <div className={styles.Title}>Uploading App Package</div>
                <div className={styles.ProgressBar}>
                    <div
                        className={styles.Progress}
                        style={{ width: `${uploadProgress.totalPercentage}%` }}
                    />
                </div>
            </>
        );
    };

    const renderProcessingAppPackageTab = (): ReactNode => {
        return (
            <>
                <div className={styles.Title}>Processing App Package</div>
                <div className={styles.Spinner}>
                    <div className={`${styles.Rect} ${styles.One}`} />
                    <div className={`${styles.Rect} ${styles.Two}`} />
                    <div className={`${styles.Rect} ${styles.Three}`} />
                    <div className={`${styles.Rect} ${styles.Four}`} />
                    <div className={`${styles.Rect} ${styles.Five}`} />
                </div>
            </>
        );
    };

    const renderUploadAppPackageTabContent = (): ReactNode => {
        switch (selectedAppVersion?.status) {
            case 'INIT':
                return renderSelectingAppPackageTab();
            case 'ERROR':
                return renderUploadAppPackageErrorTab(
                    selectedAppVersion?.errorMessage,
                );
            case 'UPLOADING':
                return renderUploadingAppPackageTab();
            case 'PROCESSING':
                return renderProcessingAppPackageTab();
        }
    };

    const renderUploadAppVersionPackage = (): ReactNode => {
        return (
            <div className={`${styles.Box} ${styles.UploadAppPackage}`}>
                {renderUploadAppPackageTabContent()}
            </div>
        );
    };

    const renderAppVersionDetail = (): ReactNode => {
        return (
            selectedAppVersion && (
                <div className={`${styles.Box} ${styles.VersionDetail}`}>
                    {selectedAppVersion.locked && (
                        <div className={`${styles.Row} ${styles.Lock}`}>
                            <MaterialIconUI>lock</MaterialIconUI>
                        </div>
                    )}

                    <div className={`${styles.Row} ${styles.Icon}`}>
                        <img
                            className={styles.Icon}
                            src={props.deps.fileClient.getRemoteFileUrl(
                                selectedAppVersion.iconPath(APP_VERSION_ICON_SIZE),
                            )}
                        />
                    </div>
                    <div className={`${styles.Row} ${styles.Name}`}>
                        <span className={`${styles.Label} ${styles.SameRow}`}>
                            Name:
                        </span>
                        {selectedAppVersion.appName}
                    </div>
                    <div className={`${styles.Row} ${styles.Description}`}>
                        <span className={`${styles.Label} ${styles.SameRow}`}>
                            Description:
                        </span>
                        {selectedAppVersion.description}
                    </div>
                    <div className={`${styles.Row} ${styles.Changes}`}>
                        <div className={`${styles.Label} ${styles.NextRow}`}>
                            Changes:
                        </div>
                        <div className={styles.ChangeList}>
                            {selectedAppVersion.changes?.map(
                                (change, index) => (
                                    <div key={index} className={styles.Change}>
                                        {change}
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                    <div className={`${styles.Row} ${styles.CreatedAt}`}>
                        <span className={`${styles.Label} ${styles.SameRow}`}>
                            Created at:
                        </span>
                        {moment(selectedAppVersion.createdAt).format('l LT')}
                    </div>
                    <div className={`${styles.Row} ${styles.Buttons}`}>
                        <div className={styles.Download}>
                            <LinkButtonUI
                                label={'Download'}
                                href={props.deps.fileClient.getRemoteFolderDownloadUrl(
                                    selectedAppVersion.packagePath,
                                )}
                            />
                        </div>
                        {!selectedAppVersion.locked && (
                            <div
                                className={styles.Delete}
                                onClick={onDeleteVersionClick}
                            >
                                <ButtonUI label={'Delete'} />
                            </div>
                        )}
                    </div>
                </div>
            )
        );
    };

    const app = props.deps.graphSource.app(props.appId);
    return (
        <div className={styles.VersionsTab}>
            <div className={styles.VersionsSection}>
                <div
                    className={`${styles.Action} ${styles.CreateVersion}`}
                    onClick={onCreateVersionClick}
                >
                    Create Version
                </div>
                <div className={styles.VersionList}>
                    {app?.versions
                        ?.sort(
                            (appVersion1, appVersion2) =>
                                appVersion2.number - appVersion1.number,
                        )
                        .map((appVersion) => (
                            <div
                                key={appVersion.number}
                                className={`${styles.AppVersion} ${classNames({
                                    [styles.Active]:
                                        appVersion.number ==
                                        selectedAppVersion?.number,
                                })}`}
                                onClick={onVersionNumberClickHandler(
                                    appVersion,
                                )}
                            >
                                {appVersion.number}
                            </div>
                        ))}
                </div>
            </div>
            <div className={styles.AppVersionDetail}>
                {selectedAppVersion &&
                    (selectedAppVersion.status === 'READY'
                        ? renderAppVersionDetail()
                        : renderUploadAppVersionPackage())}
            </div>
        </div>
    );
}
