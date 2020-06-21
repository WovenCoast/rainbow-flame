export interface APIUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  guilds: APIGuildMin[];
  admin: boolean;
}

export interface APIGuildMin {
  id: string;
  name: string;
  icon: string;
  admin: boolean;
  invited: boolean;
}
