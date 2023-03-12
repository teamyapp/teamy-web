import { beforeEach, describe, expect, it } from 'vitest';

import { Router } from './router';

describe('Router', () => {
    let router: Router;
    beforeEach(() => {
        router = new Router();
    });

    it('empty routePatten', () => {
        const err = router.registerRoute('');
        expect(err).toBe('InvalidRoutePatten');
    });

    it(`route pattern must start with '/'`, () => {
        const err = router.registerRoute('teams');
        expect(err).toBe('InvalidRoutePatten');
    });

    it('route pattern must contain unique path parameter', () => {
        const err = router.registerRoute('/teams/{teamId}/users/{teamId}');
        expect(err).toBe('DuplicatedPathParam');
    });

    it('path parameter must match between routes', () => {
        let err = router.registerRoute('/teams/{teamId}/users');
        expect(err).toBeUndefined();
        err = router.registerRoute('/teams/{teamIds}/next');
        expect(err).toBe('PathParamNotMatch');
    });

    it('empty uri', () => {
        const err = router.navigateTo('');
        expect(err).toBe('InvalidUri');
    });

    it('no route registered', () => {
        const err = router.navigateTo('/teams/1/me/next');
        expect(err).toBe('RouteNotFound');
    });

    it('match root route', async () => {
        const err = router.registerRoute('/');
        expect(err).toBeUndefined();

        const navErr = router.navigateTo('/teams/1/me/next');
        expect(navErr).toBeUndefined();

        const channel = router.subscribeRouteChange();
        const route = await channel?.pop();
        expect(route?.params?.pathParams).toEqual({});
    });

    it('match prefix', async () => {
        const err = router.registerRoute('/teams');
        expect(err).toBeUndefined();

        const navErr = router.navigateTo('/teams/1/me/next');
        expect(navErr).toBeUndefined();

        const channel = router.subscribeRouteChange();
        const route = await channel?.pop();
        expect(route?.params?.pathParams).toEqual({});
    });

    it('match prefix with 1 path parameter', async () => {
        const err = router.registerRoute('/teams/{teamId}');
        expect(err).toBeUndefined();

        const navErr = router.navigateTo('/teams/1/me/next');
        expect(navErr).toBeUndefined();

        const channel = router.subscribeRouteChange();
        const route = await channel?.pop();
        expect(route?.params?.pathParams).toEqual({ teamId: '1' });
    });

    it('match prefix with 1 path parameter & extra suffix', async () => {
        const err = router.registerRoute('/teams/{teamId}/me');
        expect(err).toBeUndefined();

        const navErr = router.navigateTo('/teams/1/me/next');
        expect(navErr).toBeUndefined();

        const channel = router.subscribeRouteChange();
        const route = await channel?.pop();
        expect(route?.params?.pathParams).toEqual({ teamId: '1' });
    });

    it('match multiple path parameters', async () => {
        const err = router.registerRoute('/teams/{teamId}/users/{userId}');
        expect(err).toBeUndefined();

        const navErr = router.navigateTo('/teams/1/users/2');
        expect(navErr).toBeUndefined();

        const channel = router.subscribeRouteChange();
        const route = await channel?.pop();
        expect(route?.params?.pathParams).toEqual({ teamId: '1', userId: '2' });
    });

    it('empty path with query params', async () => {
        const err = router.registerRoute('/');
        expect(err).toBeUndefined();

        const navErr = router.navigateTo('?query=pop&date=today&user_id=10');
        expect(navErr).toBe('InvalidUri');
    });

    it('multiple path params with query params', async () => {
        let err = router.registerRoute('/teams/{teamId}/users/{userId}');
        expect(err).toBeUndefined();

        const navErr = router.navigateTo(
            '/teams/1/users/2?query=pop&date=today&userId=10',
        );
        expect(navErr).toBeUndefined();

        const channel = router.subscribeRouteChange();
        const route = await channel?.pop();
        expect(route?.params?.pathParams).toEqual({ teamId: '1', userId: '2' });
        expect(route?.params?.queryParams).toEqual({
            query: 'pop',
            date: 'today',
            userId: '10',
        });
    });

    it('match prefix got route not found', async () => {
        let err = router.registerRoute('/teams/{teamId}/users/{userId}');
        expect(err).toBeUndefined();

        const navErr = router.navigateTo('/teams/1/next/2');
        expect(navErr).toBe('RouteNotFound');
    });

    it('match the longest route pattern', async () => {
        let err1 = router.registerRoute('/teams/{teamId}/users/{userId}');
        expect(err1).toBeUndefined();

        let err2 = router.registerRoute('/teams/{teamId}/users');
        expect(err2).toBeUndefined();

        let err3 = router.registerRoute('/teams/{teamId}');
        expect(err3).toBeUndefined();

        let err4 = router.registerRoute('/');
        expect(err4).toBeUndefined();

        const channel = router.subscribeRouteChange();
        {
            const navErr = router.navigateTo('/teams/1/users/2');
            expect(navErr).toBeUndefined();
            const route = await channel?.pop();
            expect(route?.params?.pathParams).toEqual({
                teamId: '1',
                userId: '2',
            });
        }

        {
            const navErr = router.navigateTo('/teams/1/users');
            expect(navErr).toBeUndefined();
            const route = await channel?.pop();
            expect(route?.params?.pathParams).toEqual({ teamId: '1' });
        }

        {
            const navErr = router.navigateTo('/teams/1');
            expect(navErr).toBeUndefined();
            const route = await channel?.pop();
            expect(route?.params?.pathParams).toEqual({ teamId: '1' });
        }

        {
            const navErr = router.navigateTo('/teams');
            expect(navErr).toBeUndefined();
            const route = await channel?.pop();
            expect(route?.params?.pathParams).toEqual({});
        }
    });
});
