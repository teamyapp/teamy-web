import React, { Component, ReactNode, RefObject, createRef } from 'react';

import styles from './Tabs.module.scss';

interface Props {
    defaultSelectedIndex?: number;
    tabNames: string[];
    onTabClick?: (tableIndex: number) => void;
}

interface State {
    selectedTabIndex: number;
    activateTabIndicatorWidth: number;
}

export class TabsUI extends Component<Props, State> {
    private readonly containerRef = createRef<HTMLDivElement>();

    private readonly tabsRef: RefObject<HTMLDivElement>[];
    private readonly activeTabIndicatorRef: RefObject<HTMLDivElement> =
        createRef();

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedTabIndex: props.defaultSelectedIndex || 0,
            activateTabIndicatorWidth: 0,
        };
        this.tabsRef = this.props.tabNames.map((_: string) => createRef());
    }

    public render(): ReactNode {
        let indicatorLeft = this.getActiveTabIndicatorLeft();
        return (
            <div ref={this.containerRef} className={styles.Tabs}>
                {this.props.tabNames.map(this.renderTab)}
                {this.props.tabNames && (
                    <div
                        ref={this.activeTabIndicatorRef}
                        className={styles.ActiveTabMarker}
                        style={{
                            width: this.state.activateTabIndicatorWidth,
                            left: indicatorLeft,
                        }}
                    />
                )}
            </div>
        );
    }

    renderTab = (name: string, index: number): ReactNode => {
        return (
            <div
                ref={this.tabsRef[index]}
                className={styles.Tab}
                key={index}
                onClick={this.onTabClickHandler(index)}
            >
                {name}
            </div>
        );
    };

    public componentDidMount() {
        this.updateActiveTabIndicatorWidth();
        window.addEventListener('resize', this.updateActiveTabIndicatorWidth);
    }

    public componentWillUnmount() {
        window.removeEventListener(
            'resize',
            this.updateActiveTabIndicatorWidth,
        );
    }

    public setSelectedTabIndex(selectedTabIndex: number) {
        this.setState({
            selectedTabIndex,
        });
    }

    private updateActiveTabIndicatorWidth = () => {
        const width =
            this.containerRef.current == null
                ? 0
                : this.containerRef.current.offsetWidth /
                  this.props.tabNames.length;
        this.setState({
            activateTabIndicatorWidth: width,
        });
    };

    private getActiveTabIndicatorLeft(): number {
        let ref = this.tabsRef[this.state.selectedTabIndex];
        return ref?.current?.offsetLeft || 0;
    }

    private onTabClickHandler(index: number): () => void {
        return () => {
            this.setState({
                selectedTabIndex: index,
            });
            this.props.onTabClick?.call(this, index);
        };
    }
}
