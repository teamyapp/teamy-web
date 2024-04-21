import { useEffect, useState } from 'react';

import styles from './AppIcon.component.module.scss';

interface Props {
    appName: string;
    appIconUrl?: string;
}

export const AppIconComponent = (props: Props) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [canLoadIcon, setCanLoadIcon] = useState(false);

    useEffect(() => {
        if (props.appIconUrl) {
            const img = new Image();
            img.src = props.appIconUrl;
            img.onload = () => {
                setCanLoadIcon(true);
                setIsLoaded(true);
            };
            img.onerror = () => {
                setCanLoadIcon(false);
                setIsLoaded(true);
            };
        } else {
            setIsLoaded(true);
        }
    }, [props.appIconUrl]);

    return (
        <div className={styles.Icon}>
            {isLoaded &&
                (props.appIconUrl && canLoadIcon ? (
                    <img alt={props.appName} src={props.appIconUrl} />
                ) : (
                    <div className={styles.Default}>
                        {props.appName[0].toUpperCase()}
                    </div>
                ))}
        </div>
    );
};
