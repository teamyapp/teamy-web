import { gql } from '@apollo/client';

const fragmentTaskPreview = `
fragment taskPreview on Task {
    id
    goal
    dueAt
    context
    creator {
        id
    }
    owner {
        id
        firstName
        lastName
        profileUrl
    }
    availableActions
    createdAt
}
`;

export const mePage = gql`
    query me {
        me {
            id
            firstName
            lastName
            profileUrl
            activeTeam {
                id
                tasksNeedAttention(isMine: true) {
                    ...taskPreview
                }
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
            teams {
                id
                name
                iconUrl
            }
        }
    }

    ${fragmentTaskPreview}
`;

export const me = gql`
    query me {
        me {
            id
            firstName
            lastName
            profileUrl
        }
    }
`;

export const personalStatus = gql`
    query personalStatus {
        me {
            id
            activeTeam {
                id
                tasksNeedAttention(isMine: true) {
                    ...taskPreview
                }
                upcomingTasks: tasks(input: { status: UPCOMING }) {
                    ...taskPreview
                }
                deliveredTasks: tasks(input: { status: DELIVERED }) {
                    ...taskPreview
                }
            }
        }
    }

    ${fragmentTaskPreview}
`;

export const teamStatus = gql`
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
    ${fragmentTaskPreview}
`;

export const task = gql`
    query task($id: ID!) {
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
            availableActions
            createdAt
        }
    }
`;

export const teamMembers = gql`
    query teamMembers {
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

export const activeTeamId = gql`
    query activeTeamId {
        me {
            id
            activeTeam {
                id
            }
        }
    }
`;

export const teams = gql`
    query teams {
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

export const teamsWithMembers = gql`
    query teams($ids: [ID!]!) {
        me {
            teams(ids: $ids) {
                id
                name
                iconUrl
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
