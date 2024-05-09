import AbstractQueue from "./AbstractQueue";

export default class Queue<T> extends AbstractQueue<T> {
  constructor(initValues?: T[]) {
    super(initValues);
  }

  get head() {
    return this.elements[0];
  }

  get tail() {
    return this.elements[this.size - 1];
  }
}
