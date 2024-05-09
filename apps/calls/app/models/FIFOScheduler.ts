import type { Task } from "./AbstractScheduler";

export default class FIFOScheduler {
  chain = Promise.resolve();

  schedule<T>(task: Task<T>) {
    return new Promise<T>((resolve, reject) => {
      this.chain = this.chain.then(async () => {
        try {
          resolve(await task());
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}
