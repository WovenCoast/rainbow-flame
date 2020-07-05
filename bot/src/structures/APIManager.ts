import { AkairoClient } from "discord-akairo";

import { HasteAPI } from "./apis/Haste";
import { VultrexAPI } from "./apis/Vultrex";
import { MinecraftAPI } from "./apis/Minecraft";
import { RadioGardenAPI } from "./apis/RadioGarden";
import { CoronaAPI } from "./apis/Corona";
import { DuckDuckGoAPI } from "./apis/DuckDuckGo";
import { UrbanAPI } from "./apis/Urban";

export class APIManager {
  client: AkairoClient;
  hastebin: HasteAPI;
  minecraft: MinecraftAPI;
  radioGarden: RadioGardenAPI;
  vultrex: VultrexAPI;
  corona: CoronaAPI;
  duckDuckGo: DuckDuckGoAPI;
  urban: UrbanAPI;
  constructor(client: AkairoClient) {
    this.client = client;
    this.hastebin = new HasteAPI(client);
    this.minecraft = new MinecraftAPI(client);
    this.radioGarden = new RadioGardenAPI(client);
    this.vultrex = new VultrexAPI(client, process.env.VULTREX_TOKEN);
    this.corona = new CoronaAPI(client);
    this.duckDuckGo = new DuckDuckGoAPI(client);
    this.urban = new UrbanAPI(client);
  }
  public async postServerCount() {
    if (!this.client.user) {
      this.client.on("ready", () => {
        this.postServerCount();
      });
    }
    if (this.client.user.tag !== "RainbowFlame#3927") {
      console.warn(
        `Server count not posted as '${this.client.user.tag}' is not 'RainbowFlame#3927'`
      );
      return;
    }
    await this.vultrex.postServerCount();
    console.debug(
      `Server count of ${this.client.user.tag} (${this.client.guilds.cache.size}) successfully sent!`
    );
  }
}
