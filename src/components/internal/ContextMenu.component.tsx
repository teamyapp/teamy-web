import React, { Component, ReactNode, createRef } from 'react';

import styles from './ContextMenu.component.module.scss';

export interface MenuItem {
    key: string;
    action: () => void;
    label: ReactNode;
}

interface Props {
    menuItems: MenuItem[];
    afterClose?: () => void;
}

interface State {
    show: boolean;
    top: number;
    left: number;
}

export class ContextMenuComponent extends Component<Props, State> {
    private contextMenuRef = createRef<HTMLUListElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            show: false,
            top: 0,
            left: 0,
        };
    }

    render() {
        return (
            this.state.show && (
                <ul
                    role={'menu'}
                    ref={this.contextMenuRef}
                    className={styles.ContextMenu}
                    tabIndex={-1}
                    style={{
                        top: this.state.top,
                        left: this.state.left,
                    }}
                    onBlur={this.close}
                >
                    {this.props.menuItems.map((item) => {
                        return (
                            <li
                                role={'menuitem'}
                                className={styles.ContextMenuItem}
                                onClick={this.onItemClick(item.action)}
                                key={item.key}
                            >
                                {item.label}
                            </li>
                        );
                    })}
                </ul>
            )
        );
    }

    public open = (top: number, left: number): Promise<void> => {
        return new Promise((resolve) => {
            this.setState(
                {
                    show: true,
                    top: top,
                    left: left,
                },
                () => {
                    resolve();
                    this.contextMenuRef.current?.focus();
                },
            );
        });
    };

    private close = () => {
        this.setState(
            {
                show: false,
                top: 0,
                left: 0,
            },
            this.props.afterClose,
        );
    };

    private onItemClick = (action: () => void) => () => {
        action();
        this.close();
    };
}
