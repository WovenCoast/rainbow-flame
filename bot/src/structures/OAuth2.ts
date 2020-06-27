import { Request } from "express";
import { AkairoClient } from "discord-akairo";
import { Guild } from "discord.js";
import fetch from "node-fetch";
import { owners } from "../Config";
import { APIUser, APIGuildMin } from "./Interfaces";

export default class OAuth2 {
  protected client: AkairoClient;
  protected guilds: object;

  public constructor(client: AkairoClient) {
    this.client = client;
    this.guilds = new Object();
  }

  public async resolveInformation(req: Request): Promise<APIUser | null> {
    if (!req.session.token) return null;
    const userReq = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${req.session.token}`,
      },
    });

    const user = await userReq.json();
    if (!user.id) return null;

    if (!this.guilds[user.id]) {
      const guildsReq = await fetch(
        "https://discord.com/api/users/@me/guilds",
        {
          headers: {
            Authorization: `Bearer ${req.session.token}`,
          },
        }
      );
      const guildsRes = await guildsReq.json();

      this.guilds[user.id] = guildsRes;
      setTimeout(() => {
        delete this.guilds[user.id];
      }, 3e5);
    }

    return {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096`,
      admin: owners.includes(user.id),
      guilds: this.guilds[user.id].map(
        (guild): APIGuildMin => {
          const g: Guild = this.client.guilds.cache.get(guild.id);
          return {
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            admin: g
              ? g.members.cache.get(user.id).permissions.has("MANAGE_GUILD")
              : guild.owner,
            invited: !!g,
          };
        }
      ),
    };
  }
}
