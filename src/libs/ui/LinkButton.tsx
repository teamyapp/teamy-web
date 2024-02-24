import React from 'react';
import styles from './LinkButton.module.scss';

interface Props {
  label: string;
  href: string;
  target?: string;
}

export const LinkButtonUI = ({label, href, target}: Props) => {
  return (
    <a
      target={target}
      href={href}
      aria-label={label}
      className={styles.LinkButton}
    >
      {label}
    </a>
  )  
}