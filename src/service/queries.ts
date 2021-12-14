import { gql } from '@apollo/client';

export const QueryMe = gql`
    query Me {
        me {
            id
            firstName
            lastName
            profileUrl
        }
    }
`;

export const QueryPersonalStatus = gql`
    query personalStatus($userId: ID!) {
        me {
            id
            activeTeam {
                id
                tasksNeedAttention(isMine: true) {
                    ...taskPreview
                }
                upcomingTasks: tasks(
                    input: { status: UPCOMING, ownerId: $userId }
                ) {
                    ...taskPreview
                }
                deliveredTasks: tasks(
                    input: { status: DELIVERED, ownerId: $userId }
                ) {
                    ...taskPreview
                }
            }
        }
    }

    fragment taskPreview on Task {
        id
        goal
        dueAt
        owner {
            id
            firstName
            lastName
            profileUrl
        }
        availableActions
    }
`;

export const QueryTeamStatus = gql`
    query TeamStatus {
        me {
            id
            activeTeam {
                id
                upcomingTasks: tasks(input: { status: UPCOMING }) {
                    ...taskPreview
                }
                inProgressTasks: tasks(input: { status: IN_PROGRESS }) {
                    ...taskPreview
                }
                deliveredTasks: tasks(input: { status: DELIVERED }) {
                    ...taskPreview
                }
            }
        }
    }

    fragment taskPreview on Task {
        id
        goal
        dueAt
        owner {
            id
            firstName
            lastName
            profileUrl
        }
        availableActions
    }
`;

export const QueryGetTask = gql`
    query getTask($id: ID!) {
        task(id: $id) {
            id
            goal
            dueAt
            context
            owner {
                id
                firstName
                lastName
                profileUrl
            }
            # effort
            # numOfUnknowns
            availableActions
            createdAt
        }
    }
`;

export const QueryTeamMembers = gql`
    query TeamMembers {
        me {
            id
            activeTeam {
                id
                members {
                    id
                    firstName
                    lastName
                    profileUrl
                }
            }
        }
    }
`;

export const QueryActiveTeamId = gql`
    query ActiveTeamId {
        me {
            id
            activeTeam {
                id
            }
        }
    }
`;

export const QueryTeams = gql`
    query Teams {
        me {
            id
            teams {
                id
                name
                iconUrl
            }
        }
    }
`;
