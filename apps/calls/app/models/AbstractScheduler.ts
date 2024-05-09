export type Task<Value = unknown> = () => Value | Promise<Value>;

export interface SchedulerTaskOptions<T> {
  task: Task<T>;
}

export default abstract class AbstractScheduler<T> {
  tasks: SchedulerTaskOptions<T>[] = [];

  chain = Promise.resolve();

  add(task: Task<T>) {
    this.tasks.push({ task });
  }

  async run() {
    try {
      while (this.tasks.length) {
        const nextTask = this.tasks.pop();
        await nextTask?.task();
      }
    } catch (error) {
      console.error("[AbstractScheduler Runner error]", error);

      throw error;
    }
  }
}
