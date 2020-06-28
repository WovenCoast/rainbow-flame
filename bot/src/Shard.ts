import { token } from "./Config";
import { ShardingManager } from "discord.js";
const shard = new ShardingManager("dist/Bot.js", {
  token,
  respawn: true,
});

shard.spawn(2);
