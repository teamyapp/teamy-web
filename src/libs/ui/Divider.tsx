import { FC } from "react";
import styles from './Divider.module.scss';
import classNames from "classnames";

interface Props {
    vertical?: boolean;
}

export const DividerUI: FC<Props> = ({vertical}) =>{
    return (
        <div className={classNames(styles.Divider, {[styles.Vertical]: vertical, [styles.Horizontal]: !vertical})}/>
    )
}