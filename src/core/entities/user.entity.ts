import { SessionUser } from './session-user.entity';

export class User {
  id: string;
  name: string;
  sessions?: SessionUser[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
