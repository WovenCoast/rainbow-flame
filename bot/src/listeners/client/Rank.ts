import { Listener } from "discord-akairo";
import { Message } from "discord.js";
import { prefix } from "../../Config";
import { Rank } from "../../models/Rank";
import { Repository } from "typeorm";
import { randomValue } from "../../Utils";

export default class RankListener extends Listener {
  constructor() {
    super("rank", {
      emitter: "client",
      event: "message",
      category: "client",
    });
  }

  public async exec(message: Message) {
    if (message.author.bot) return;
    if (message.content.startsWith(prefix)) return;
    if (message.partial) message = await message.fetch();
    const cooldown = this.client.settings.get(
      message.guild,
      "rank.cooldown",
      6e4
    );
    const rankRepo: Repository<Rank> = this.client.db.getRepository(Rank);
    const rank: Rank = await rankRepo.findOne({
      guild: message.guild.id,
      user: message.author.id,
    });
    if (!rank) {
      return rankRepo.insert({
        guild: message.guild.id,
        user: message.author.id,
        lastIncrement: Date.now(),
        level: 1,
        xp: randomValue(5, 15),
      });
    }
    const properties = {
      level: rank.level,
      xp: rank.xp,
      user: `**${message.author.tag}**`,
    };
    if (Date.now() - rank.lastIncrement <= cooldown) return;
    const newXp = rank.xp + randomValue(5, 15);
    const xpForNextLevel =
      rank.level *
      ((this.client.settings.get(
        message.guild,
        "rank.difficulty",
        1
      ) as number) *
        50);
    rank.lastIncrement = Date.now();
    rank.xp = newXp;
    if (newXp >= xpForNextLevel) {
      rank.xp = randomValue(2, 10);
      rank.level++;
      properties.level = rank.level;
      properties.xp = rank.xp;
      if (this.client.settings.get(message.guild, "rank.levelUp", false))
        message.channel.send(
          (this.client.settings.get(
            message.guild,
            "rank.levelUpMessage",
            "{user}, you just levelled upto **level {level}**!"
          ) as string).replace(
            /{(.*)}/gi,
            (match, property, offset, string) => properties[property]
          )
        );
    }
    rankRepo.update({ guild: rank.guild, user: rank.user }, rank);
  }
}
