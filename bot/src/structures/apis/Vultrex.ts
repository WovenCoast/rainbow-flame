import axios from "axios";
import { AkairoClient } from "discord-akairo";

const endpoint = "https://api.vultrex.io/v2/vapi/server-count";

export class VultrexAPI {
  client: AkairoClient;
  token: string;
  constructor(client: AkairoClient, token: string) {
    this.client = client;
    this.token = token;
  }
  public async postServerCount(): Promise<void> {
    return await axios.post(
      endpoint,
      JSON.stringify({
        serverCount: this.client.guilds.cache.size,
        bot: this.client.user.id,
      }),
      {
        method: "POST",
        headers: {
          Authorization: this.token,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
