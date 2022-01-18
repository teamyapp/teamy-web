import React, { Component, ReactElement } from 'react';

import { PopChannel } from '@lib/csp/csp';

import {
    Errors,
    Params,
    RouteUpdate,
    Router,
    sanitizePathPattern,
} from './router';

interface Props {
    router: Router;
    pathPattern: string;
    renderChild?: (params: Params) => ReactElement | null;
}

interface State {
    shouldShow: boolean;
    params?: Params;
    err?: Errors;
}

export class Route extends Component<Props, State> {
    private routeChangeChan?: PopChannel<RouteUpdate | undefined>;

    constructor(props: Props) {
        super(props);
        this.state = {
            shouldShow: false,
        };
    }

    public componentDidMount() {
        const pathPattern = sanitizePathPattern(this.props.pathPattern);
        const err = this.props.router.registerRoute(pathPattern);
        if (err) {
            this.setState({
                err,
            });
            return;
        }

        this.routeChangeChan = this.props.router.subscribeRouteChange();
        (async () => {
            while (true) {
                const route = await this.routeChangeChan?.pop();
                if (route === undefined) {
                    return;
                }

                if (!route.pathPattern.startsWith(pathPattern)) {
                    this.setState({
                        shouldShow: false,
                    });
                    continue;
                }
                this.setState({
                    shouldShow: true,
                    params: route.params,
                });
            }
        })();
    }

    render() {
        if (this.state.err) {
            return <div>{this.state.err}</div>;
        }
        if (!this.state.shouldShow) {
            return null;
        }

        if (this.props.renderChild) {
            return this.props.renderChild(this.state.params!);
        } else {
            return this.props.children;
        }
    }

    public componentWillUnmount() {
        this.routeChangeChan?.close();
    }
}
