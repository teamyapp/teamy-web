import { gql } from '@apollo/client';

export const updateTask = gql`
    mutation updateTask($taskId: ID!, $taskInput: TaskInput!) {
        updateTask(taskId: $taskId, task: $taskInput) {
            id
            goal
            context
            dueAt
            owner {
                id
            }
        }
    }
`;
export const deleteTask = gql`
    mutation deleteTask($taskId: ID!) {
        deleteTask(taskId: $taskId) {
            id
        }
    }
`;

export const startTask = gql`
    mutation startTask($taskId: ID!, $task: TaskInput!) {
        updateTask(taskId: $taskId, task: $task) {
            status
            id
        }
        promoteTaskToNeedAttention(taskId: $taskId) {
            id
        }
    }
`;

export const completeTask = gql`
    mutation completeTask($taskId: ID!, $task: TaskInput!) {
        updateTask(taskId: $taskId, task: $task) {
            id
            status
        }
    }
`;

export const createTask = gql`
    mutation createTask($taskInput: TaskInput!) {
        createTask(task: $taskInput) {
            id
            goal
            context
            owner {
                id
            }
        }
    }
`;

export const updateUser = gql`
    mutation updateUser($userId: ID!, $userInput: UserUpdateInput!) {
        user(id: $userId) {
            updateUser(input: $userInput) {
                user {
                    id
                    firstName
                    lastName
                    profileUrl
                }
            }
        }
    }
`;

export const updateActiveTeam = gql`
    mutation updateActiveTeam($teamId: ID!) {
        updateActiveTeam(teamId: $teamId) {
            id
        }
    }
`;

export const addTeamMember = gql`
    mutation addTeamMember($teamId: ID!, $newMemberId: ID!) {
        team(id: $teamId) {
            addMember(id: $newMemberId) {
                team {
                    members {
                        id
                    }
                }
            }
        }
    }
`;

export const updateTeam = gql`
    mutation updateTeam($teamId: ID!, $teamInput: TeamUpdateInput!) {
        team(id: $teamId) {
            update(input: $teamInput) {
                team {
                    id
                }
            }
        }
    }
`;

export const createComment = gql`
    mutation createComment($taskId: ID!, $content: String!) {
        createComment(taskId: $taskId, content: $content) {
            id
        }
    }
`;

export const deleteComment = gql`
    mutation deleteComment($commentId: ID!) {
        comment(id: $commentId) {
            delete {
                id
            }
        }
    }
`;

export const updateComment = gql`
    mutation updateComment($commentId: ID!, $content: String!) {
        comment(id: $commentId) {
            updateContent(content: $content) {
                comment {
                    id
                }
            }
        }
    }
`;
