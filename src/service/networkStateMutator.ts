import { MutationEvent } from '@core/entity/events';
import { TaskService } from '@core/service/task.service';

export function createNetworkStateMutator(
    taskService: TaskService,
): (event: MutationEvent) => Promise<void> {
    return async (event: MutationEvent) => {
        switch (event.type) {
            case 'CreateTask':
                await taskService.createTask(event.task);
                return;
            case 'UpdateTask':
                await taskService.updateTask(event.task);
                return;
            case 'DeleteTask':
                await taskService.deleteTask(event.taskId);
                return;
            case 'StartTask':
                await taskService.startTask(event.taskId);
                return;
            case 'CompleteTask':
                await taskService.completeTask(event.taskId);
                return;
        }
    };
}
