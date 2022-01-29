import React, { Component, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import styles from './DropDownList.module.scss';

export interface Option {
    key: string;
    description: string;
}

interface Props {
    selectOptionKey?: string;
    options: Option[];
    onSelectOption?: (optionKey: string) => void;
}

interface State {
    selectedOption?: Option;
    showAvailableOptions: boolean;
}

export class DropDownList extends Component<Props, State> {
    private readonly availableOptionsRef = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);

        const options: { [key: string]: Option } = {};
        for (const option of this.props.options) {
            options[option.key] = option;
        }
        this.state = {
            selectedOption: this.props.selectOptionKey
                ? options[this.props.selectOptionKey]
                : undefined,
            showAvailableOptions: false,
        };
    }

    public render() {
        return (
            <div className={styles.DropDownList}>
                <div
                    className={styles.SelectedOption}
                    onClick={this.onSelectedOptionClick}
                >
                    <div className={styles.Option}>
                        {this.state.selectedOption &&
                            this.state.selectedOption.description}
                    </div>
                    <div className={styles.DropDownButton}>
                        <MaterialIconUI>arrow_drop_down</MaterialIconUI>
                    </div>
                </div>
                {this.state.showAvailableOptions && (
                    <div
                        ref={this.availableOptionsRef}
                        className={styles.AvailableOptions}
                        tabIndex={-1}
                        onBlur={this.onAvailableOptionsBlur}
                    >
                        {this.props.options.map(this.renderOption)}
                    </div>
                )}
            </div>
        );
    }

    private renderOption = (option: Option, index: number) => {
        return (
            <div
                key={index}
                className={styles.Option}
                onClick={this.onOptionClick(option)}
            >
                {option.description}
            </div>
        );
    };

    private onOptionClick = (option: Option) => {
        return () => {
            this.setState({
                selectedOption: option,
                showAvailableOptions: false,
            });

            if (this.state.selectedOption === option) {
                return;
            }
            this.props.onSelectOption?.call(null, option.key);
        };
    };

    private onSelectedOptionClick = () => {
        this.toggleAvailableActions();
    };

    private toggleAvailableActions() {
        const showAvailableOptions = this.state.showAvailableOptions;
        this.setState({
            showAvailableOptions: !this.state.showAvailableOptions,
        });

        if (!showAvailableOptions) {
            setTimeout(() => {
                this.availableOptionsRef.current?.focus();
            });
        }
    }

    private onAvailableOptionsBlur = () => {
        this.setState({
            showAvailableOptions: false,
        });
    };
}
