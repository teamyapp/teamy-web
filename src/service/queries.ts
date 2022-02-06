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
    status
    availableActions
    createdAt
}
`;

export const myDataOfInterests = gql`
    query me {
        me {
            id
            firstName
            lastName
            profileUrl
            activeTeam {
                id
                name
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
                tasks {
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
            status
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

export const taskComments = gql`
    query comments($taskId: ID!) {
        task(id: $taskId) {
            id
            comments {
                id
                content
                commenter {
                    id
                    firstName
                    lastName
                    profileUrl
                }
                createdAt
            }
        }
    }
`;

export const teamInvitations = gql`
    query invitations($teamId: ID!) {
        teams(ids: [$teamId]) {
            invitations {
                id
                createdAt
                expireAt
                receiverFirstName
                receiverLastName
                receiver {
                    id
                }
                status
                code
            }
        }
    }
`;

export const invitations = gql`
    query invitations($filter: InvitationFilter!) {
        invitations(input: $filter) {
            id
            createdAt
            expireAt
            sender {
                firstName
                lastName
            }
            receiverFirstName
            receiverLastName
            team {
                name
                iconUrl
            }
            status
        }
    }
`;
