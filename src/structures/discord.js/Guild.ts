import { Structures, Guild } from "discord.js";
import { AkairoClient } from "discord-akairo";
import Music from "../music/MusicGuild";
export class FlameGuild extends Guild {
  music: Music;
  constructor(client: AkairoClient, data: Object) {
    super(client, data);
    this.music = new Music(this, client);
  }
}

export default Structures.extend("Guild", (Guild) => {
  return FlameGuild;
});
