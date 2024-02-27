import { useEffect, useState } from 'react';
import styles from './AppIcon.component.module.scss';

interface Props {
    appName: string;
    appIconUrl?: string;
}

export const AppIconComponent = (props: Props) => {
    const [error, setError] = useState(false);
    
    useEffect(() => {
        if(props.appIconUrl){
            const img = new Image();
            img.src = props.appIconUrl;
            img.onload = () => {
                setError(false);
            };
            img.onerror = () => {
                setError(true);
            };
        }
    }, [props.appIconUrl])

    return (
        <div className={styles.Icon}>
            {props.appIconUrl && !error ? (
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