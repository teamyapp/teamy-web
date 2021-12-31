import React, { Component, ReactElement, RefObject, createRef } from 'react';

import styles from './Tabs.module.scss';

interface IProps {
    defaultSelectedIndex?: number;
    tabNames: string[];
    onTabClick?: (tableIndex: number) => void;
}

interface IState {
    selectedTabIndex: number;
    activateTabIndicatorWidth: number;
}

export class TabsUI extends Component<IProps, IState> {
    private readonly containerRef = createRef<HTMLDivElement>();

    private readonly tabsRef: RefObject<HTMLDivElement>[];
    private readonly activeTabIndicatorRef: RefObject<HTMLDivElement> =
        createRef();

    constructor(props: IProps) {
        super(props);
        this.state = {
            selectedTabIndex: props.defaultSelectedIndex || 0,
            activateTabIndicatorWidth: 0,
        };
        this.tabsRef = this.props.tabNames.map((_: string) => createRef());
    }

    renderTab = (name: string, index: number): ReactElement => {
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

    public render(): ReactElement {
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
        if (
            this.state.selectedTabIndex < 0 ||
            this.state.selectedTabIndex >= this.tabsRef.length
        ) {
            return 0;
        }
        let ref = this.tabsRef[this.state.selectedTabIndex];
        return ref.current?.offsetLeft || 0;
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
