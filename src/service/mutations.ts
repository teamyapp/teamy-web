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
    mutation deleteTask($id: ID!) {
        deleteTask(taskId: $id) {
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
