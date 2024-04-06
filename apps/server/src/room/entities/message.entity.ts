export class Message<D, T extends string = string, M extends string = string> {
  constructor(
    public type: T,
    public message: M,
    public status = 200,
    public data: D = null,
  ) {}
}
