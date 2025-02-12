export class Vote {
  id: string;
  taskId: string;
  userId: string;
  value: number;
  timestamp: Date;

  constructor(id: string, taskId: string, userId: string, value: number) {
    this.id = id;
    this.taskId = taskId;
    this.userId = userId;
    this.value = value;
    this.timestamp = new Date();
  }
}
