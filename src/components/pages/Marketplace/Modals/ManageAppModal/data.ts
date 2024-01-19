import moment from 'moment/moment';

import { AppVersion } from '@core/entity/appVersion';
import { Group } from '@core/entity/group';
import { Rollout } from '@core/entity/rollout';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

import github2IconImg from '../../assets/github2.png';
import githubIconImg from '../../assets/github.png';

export const appVersions: AppVersion[] = [
    {
        number: 1,
        appName: 'GH',
        description: 'Github integration',
        iconUrl: github2IconImg,
        changes: ['Create initial version of app'],
        createdAt: moment().subtract('2', 'd').toDate(),
        createdBy: {
            id: 1,
            firstName: 'Harry',
            lastName: 'Liu',
            fullName: 'Harry Liu',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
        prices: [],
        isReady: true,
    },
    {
        number: 2,
        appName: 'Github',
        description: 'Github integration for Teamy',
        iconUrl: githubIconImg,
        changes: ['Use a new icon for the app', 'Clarified app description'],
        createdAt: moment().subtract('1', 'd').toDate(),
        createdBy: {
            id: 1,
            firstName: 'Harry',
            lastName: 'Liu',
            fullName: 'Harry Liu',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
        prices: [],
        isReady: true,
    },
    {
        number: 3,
        appName: 'Github',
        description: 'Github integration for Teamy',
        iconUrl: githubIconImg,
        changes: ['Support pull request automation'],
        createdAt: moment().subtract('1', 'd').toDate(),
        createdBy: {
            id: 1,
            firstName: 'Harry',
            lastName: 'Liu',
            fullName: 'Harry Liu',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
        prices: [],
        isReady: true,
    },
    {
        number: 4,
        appName: '',
        description: '',
        iconUrl: '',
        changes: [],
        createdAt: moment().subtract('1', 'd').toDate(),
        createdBy: {
            id: 1,
            firstName: 'Harry',
            lastName: 'Liu',
            fullName: 'Harry Liu',
            profileUrl: '',
            teams: [],
            linkedUsers: [],
        },
        prices: [],
        isReady: false,
    },
];

export const userGroups: Group<User>[] = [
    {
        id: 1,
        type: 'static',
        name: 'Beta testers',
        members: [
            {
                id: 1,
                firstName: 'Harry',
                lastName: 'Liu',
                fullName: 'Harry Liu',
                profileUrl:
                    'https://cloud.staging.teamyapp.com/file/files/23133',
                teams: [],
                linkedUsers: [],
            },
            {
                id: 2,
                firstName: 'Xianbo',
                lastName: 'Duan',
                fullName: 'Xianbo Duan',
                profileUrl:
                    'https://cloud.staging.teamyapp.com/file/files/21532',
                teams: [],
                linkedUsers: [],
            },
        ],
        createdAt: new Date(),
        rollouts: [],
    },
    {
        id: 2,
        type: 'filter',
        name: 'US Teenager',
        filter: '(country=US) and (age>18) and (age<26)',
        createdAt: new Date(),
        rollouts: [],
    },
];

export const teamGroups: Group<Team>[] = [
    {
        id: 1,
        type: 'static',
        name: '1st party partners',
        members: [
            {
                id: 1,
                name: 'Teamy',
                iconUrl: 'https://cloud.staging.teamyapp.com/file/files/3469',
                creator: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
                owner: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
            },
            {
                id: 2,
                name: 'Test',
                iconUrl: '',
                creator: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
                owner: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
            },
        ],
        createdAt: new Date(),
        rollouts: [],
    },
    {
        id: 2,
        type: 'filter',
        name: 'US Massachusetts',
        filter: '(country=US) AND (state=MA)',
        createdAt: new Date(),
        rollouts: [],
    },
];

export const userGroupRollouts: Rollout<User>[] = [
    {
        id: 1,
        name: 'Initial beta',
        activator: {
            id: 1,
            type: 'static',
            createdAt: new Date(),
        },
        versionSelector: {
            id: 1,
            type: 'static',
            versionNumber: 1,
            createdAt: new Date(),
        },
        isEnabled: true,
        createdAt: new Date(),
        groups: [userGroups[0]],
    },
    {
        id: 2,
        name: 'Black Friday deals',
        activator: {
            id: 2,
            type: 'timeRange',
            startAt: moment().subtract(1, 'd').toDate(),
            endAt: moment().add(1, 'd').toDate(),
            createdAt: new Date(),
        },
        versionSelector: {
            id: 2,
            type: 'static',
            versionNumber: 2,
            createdAt: new Date(),
        },
        isEnabled: true,
        createdAt: new Date(),
        groups: [userGroups[1]],
    },
    {
        id: 3,
        name: 'Banner Testing',
        activator: {
            id: 3,
            type: 'percentage',
            percentage: 70,
            createdAt: new Date(),
        },
        versionSelector: {
            id: 3,
            type: 'experiment',
            versionNumbers: [1, 2, 3, 4],
            createdAt: new Date(),
        },
        isEnabled: true,
        createdAt: new Date(),
        groups: [userGroups[0], userGroups[1]],
    },
];

export const teamGroupRollouts: Rollout<Team>[] = [
    {
        id: 4,
        name: 'Banner Testing',
        activator: {
            id: 4,
            type: 'timeRange',
            startAt: moment().subtract(1, 'd').toDate(),
            endAt: moment().add(1, 'd').toDate(),
            createdAt: new Date(),
        },
        versionSelector: {
            id: 4,
            type: 'experiment',
            versionNumbers: [1, 2, 3, 4],
            createdAt: new Date(),
        },
        isEnabled: true,
        createdAt: new Date(),
        groups: [teamGroups[0], teamGroups[1]],
    },
];

userGroups[0].rollouts.push(userGroupRollouts[0], userGroupRollouts[2]);
userGroups[1].rollouts.push(userGroupRollouts[1], userGroupRollouts[2]);
teamGroups[0].rollouts.push(teamGroupRollouts[0]);
teamGroups[1].rollouts.push(teamGroupRollouts[0]);
