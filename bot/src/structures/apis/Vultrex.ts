import axios from "axios";
import { AkairoClient } from "discord-akairo";
import { User } from "discord.js";

const domain = "https://api.vultrex.io";
const ratelimit = 3e5;

export class VultrexAPI {
  client: AkairoClient;
  token: string;
  postEndpoint: string;
  constructor(client: AkairoClient, token: string) {
    this.client = client;
    this.token = token;
  }
  public async postServerCount(): Promise<void> {
    if (
      Date.now() -
        (this.client.settings.get(
          "global",
          "vultrex.ratelimit",
          Date.now() - ratelimit - 1000
        ) as number) >
      ratelimit
    ) {
      await this.client.settings.set("global", "vultrex.ratelimit", Date.now());
      return await axios.post(
        `${domain}/v3/bot/${this.client.user.id}/stats`,
        JSON.stringify({
          serverCount: this.client.guilds.cache.size,
          shardCount: this.client.ws.shards.size,
        }),
        {
          method: "POST",
          headers: {
            Authorization: this.token,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
    }
  }

  private async fetchVotes(): Promise<string[]> {
    return (
      await axios.post(
        `${domain}/v3/bot/${this.client.user.id}/votes`,
        JSON.stringify({
          serverCount: this.client.guilds.cache.size,
          shardCount: this.client.ws.shards.size,
        }),
        {
          method: "POST",
          headers: {
            Authorization: this.token,
            "Content-Type": "application/json",
          },
        }
      )
    ).data.response;
  }

  public async hasVoted(user: User) {
    return (await this.fetchVotes()).includes(user.id);
  }
}
