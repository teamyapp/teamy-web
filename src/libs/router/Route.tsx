import React, { Component, ReactNode } from 'react';

import { PopChannel } from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';

import {
    Errors,
    Params,
    RouteUpdate,
    Router,
    exactMatch,
    pathDelimiter,
    sanitizeRoutePattern,
} from './router';

interface Props {
    children: ReactNode;
    router: Router;
    pattern: string;
    renderChild?: (params: Params) => ReactNode | null;
    exact?: boolean;
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
        const routePattern = sanitizeRoutePattern(this.props.pattern);
        const err = this.props.router.registerRoute(routePattern, false);
        if (err) {
            this.setState({
                err,
            });
            return;
        }

        this.routeChangeChan = this.props.router.subscribeRouteChange();
        console.log('subscribe', routePattern);
        (async () => {
            while (true) {
                const route = await this.routeChangeChan?.pop();
                if (route === undefined) {
                    return;
                }

                if (this.props.exact && !exactMatch(route, routePattern)) {
                    this.setState({
                        shouldShow: false,
                    });
                    continue;
                }

                if (
                    !startsWith(
                        route.routePattern.split(pathDelimiter),
                        routePattern.split(pathDelimiter),
                    )
                ) {
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
        closeIfNot(this.routeChangeChan);
    }
}

function startsWith(long: string[], prefix: string[]): boolean {
    if (long.length < prefix.length) {
        return false;
    }

    for (let index = 0; index < prefix.length; index++) {
        if (long[index] !== prefix[index]) {
            return false;
        }
    }

    return true;
}
