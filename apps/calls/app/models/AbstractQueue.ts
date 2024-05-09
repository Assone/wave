export default abstract class AbstractQueue<T> implements Iterable<T> {
  elements: T[];

  constructor(initValues: T[] = []) {
    this.elements = initValues;
  }

  get size() {
    return this.elements.length;
  }

  get isEmpty() {
    return this.size === 0;
  }

  enqueue(value: T) {
    this.elements.push(value);
  }

  dequeue() {
    return this.elements.shift();
  }

  clean() {
    this.elements = [];
  }

  [Symbol.iterator](): Iterator<T, T | undefined> {
    let index = 0;

    return {
      next: () => {
        const done = (index >= this.size - 1) as true;
        const value = this.elements[index++];

        return { done, value };
      },
    };
  }
}
