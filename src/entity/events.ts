export type MutationEvent = TaskUpdate | TaskDelete

export interface TaskUpdate {
    type: "TaskUpdate"
    id: number
    goal: string
    context: string
}

export interface TaskDelete {
    type: "TaskDelete"
    id: number
}
