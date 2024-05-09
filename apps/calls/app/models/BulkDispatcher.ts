import Queue from "./Queue";

export default class BulkDispatcher<T, R> {
  private currentBatch = new Queue<T>();

  private chain: Promise<R> | null = null;

  constructor(private limit: number = 64) {}

  exec(data: T, callback: (bulkData: T[]) => Promise<R>) {
    if (this.currentBatch.size >= this.limit) {
      this.currentBatch.clean();
      this.chain = null;
    }

    this.currentBatch.enqueue(data);

    if (this.chain !== null) {
      return this.chain;
    }

    this.chain = new Promise((resolve, reject) => {
      setTimeout(() => {
        const bulkData = [...this.currentBatch.elements];

        callback(bulkData).then(resolve).catch(reject);
      }, 0);
    });

    return this.chain;
  }
}
