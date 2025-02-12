export class User {
  id: string;
  name: string;
  role: UserRole;
  sessionId?: string;

  constructor(id: string, name: string, role: UserRole) {
    this.id = id;
    this.name = name;
    this.role = role;
  }
}

export enum UserRole {
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT',
}
