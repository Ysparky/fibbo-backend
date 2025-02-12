import { Task } from '../../../core/entities/task.entity';
import { BaseResponseDto } from '../common/base-response.dto';

export class TaskResponseDto extends BaseResponseDto {
  task: Task;
}

export class TaskListResponseDto extends BaseResponseDto {
  tasks: Task[];
}

export class TaskUpdatedResponseDto extends BaseResponseDto {
  task: Task;
}

export class TaskDeletedResponseDto extends BaseResponseDto {
  taskId: string;
}

export class CurrentTaskChangedResponseDto extends BaseResponseDto {
  taskId: string | null;
}
