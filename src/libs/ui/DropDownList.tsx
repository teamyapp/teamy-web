import React, { Component, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import styles from './DropDownList.module.scss';
import { RelativeLayout, RelativeLayoutContainerUI } from '@lib/layout';

export interface Option {
    key: string;
    description: string;
}

interface Props {
    relativeLayout: RelativeLayout;
    selectOptionKey?: string;
    options: Option[];
    onSelectOption?: (optionKey: string) => void;
}

interface State {
    selectedOption?: Option;
}

export class DropDownList extends Component<Props, State> {
    private readonly ref = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);

        const options: Record<string, Option> = {};
        for (const option of this.props.options) {
            options[option.key] = option;
        }

        this.state = {
            selectedOption: this.props.selectOptionKey
                ? options[this.props.selectOptionKey]
                : undefined,
        };
    }

    public get value(): string | undefined {
        return this.state.selectedOption?.key;
    }

    public render() {
        return (
            <RelativeLayoutContainerUI
                relativeLayout={this.props.relativeLayout}
                overSpaceAction='jumpVertically'
                verticalAlignment='bottom'
                renderFollower={({closeContainer}) => (
                    <div className={styles.DropDownList}>
                        <div className={styles.AvailableOptions}>
                            {this.props.options.map((option, index) => {
                                return (
                                    <div
                                        key={index}
                                        role={'listitem'}
                                        className={styles.Option}
                                        onClick={this.onOptionClick(option, closeContainer)}
                                    >
                                        {option.description}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                renderReferenceElement={({ toggleContainer }) => {
                    return (
                        <div
                            className={styles.SelectedOption}
                            onClick={toggleContainer}
                        >
                            <div role={'listitem'} className={styles.Option}>
                                {this.state.selectedOption &&
                                    this.state.selectedOption.description}
                            </div>
                            <div
                                role={'button'}
                                className={styles.DropDownButton}
                            >
                                <MaterialIconUI>arrow_drop_down</MaterialIconUI>
                            </div>
                        </div>
                    );
                }}
            />
        );
    }

    public selectOption(optionKey: string) {
        this.setState({
            selectedOption: this.props.options.find((option) => {
                return option.key === optionKey;
            }),
        });
    }

    private onOptionClick = (option: Option, closeContainer: () => void) => {
        return () => {
            this.setState({
                selectedOption: option,
            });

            closeContainer();
            if (this.state.selectedOption === option) {
                return;
            }
            this.props.onSelectOption?.call(null, option.key);
        };
    };
}
