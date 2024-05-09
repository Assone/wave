import AbstractScheduler, {
  type SchedulerTaskOptions,
  type Task,
} from "./AbstractScheduler";

export default class Scheduler<T> extends AbstractScheduler<T> {
  override tasks: (SchedulerTaskOptions<T> & { priority: number })[] = [];

  override add(task: Task<T>, priority = 0) {
    this.tasks.push({ task, priority });
    this.tasks.sort((a, b) => b.priority - a.priority);
  }
}
