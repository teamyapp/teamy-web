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

export const Me = gql`
    query Me {
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
    ${fragmentTaskPreview}
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

export const QueryTeamsWithMembers = gql`
    query Teams {
        me {
            teams {
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
