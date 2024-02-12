import styles from './AppIcon.component.module.scss';

interface Props {
    appName: string;
    appIconUrl?: string;
}

export const AppIconComponent = (props: Props) => {
    return (
        <div className={styles.Icon}>
            {props.appIconUrl ? (
                <img
                    alt={props.appName}
                    src={props.appIconUrl}
                />
            ) : (
                <div className={styles.Default}>
                    {props.appName[0].toUpperCase()}
                </div>
            )}
        </div>
    );
};