import classNames from 'classnames';
import moment from 'moment/moment';
import React, { ReactNode, useState } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { AppVersion } from '@core/entity/appVersion';

import styles from './VersionsTab.component.module.scss';

type AppPackageStatus = 'selecting' | 'uploading' | 'processing' | 'ready';

interface Props {
    onCreateVersionClick: () => number;
    onDeleteVersionClick: (versionNumber: number) => void;
    appVersions?: AppVersion[];
}

export function VersionsTabComponent(props: Props) {
    const [selectedAppVersion, setSelectedAppVersion] = useState<AppVersion>();
    const [appPackageStatus, setAppPackageStatus] =
        useState<AppPackageStatus>('processing');

    const onCreateVersionClick = async () => {
        props.onCreateVersionClick();
        // TODO: show newly created version
    };

    const onVersionNumberClickHandler = (appVersion: AppVersion) => {
        return () => {
            setSelectedAppVersion(appVersion);
        };
    };

    const onDeleteVersionClick = () => {
        if (!selectedAppVersion) {
            return;
        }

        props.onDeleteVersionClick(selectedAppVersion.number)
        
    }

    const renderSelectingAppPackageTab = (): ReactNode => {
        return (
            <>
                <div className={styles.Title}>Select App Package</div>
                <div className={`${styles.Button} ${styles.SelectFile}`}>
                    <div className={styles.Icon}>
                        <MaterialIconUI>upload_file</MaterialIconUI>
                    </div>
                    <input type={'file'} className={styles.FileInput} />
                </div>
            </>
        );
    };

    const renderUploadingAppPackageTab = (): ReactNode => {
        return (
            <>
                <div className={styles.Title}>Uploading App Package</div>
                <div className={styles.ProgressBar}>
                    <div className={styles.Progress} />
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
        switch (appPackageStatus) {
            case 'selecting':
                return renderSelectingAppPackageTab();
            case 'uploading':
                return renderUploadingAppPackageTab();
            case 'processing':
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
                    <div className={`${styles.Row} ${styles.Icon}`}>
                        <img
                            className={styles.Icon}
                            src={selectedAppVersion.iconUrl}
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
                            {selectedAppVersion.changes.map(
                                (index: string, change) => (
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
                            <ButtonUI label={'Download'} />
                        </div>
                        <div className={styles.Delete} onClick={onDeleteVersionClick}>
                            <ButtonUI label={'Delete'} />
                        </div>
                    </div>
                </div>
            )
        );
    };

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
                    {props.appVersions?.sort(
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
                    (selectedAppVersion.isReady
                        ? renderAppVersionDetail()
                        : renderUploadAppVersionPackage())}
            </div>
        </div>
    );
}
