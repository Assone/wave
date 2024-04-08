export class User {
  constructor(
    public id: string,
    public owner: boolean = false,
    public streaming: boolean = false,
  ) {}
}
