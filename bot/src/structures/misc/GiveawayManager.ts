import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { Repository } from "typeorm";
import { Giveaway } from "../../models/Giveaway";
import { colors } from "../../Config";

export default {
  async end(giveawayRepo: Repository<Giveaway>, msg: Message) {
    try {
      await msg.fetch();
      const giveaway: Giveaway = (
        await giveawayRepo.find({ message: msg.id })
      )[0];
      giveawayRepo.delete({ message: msg.id });

      const reaction: MessageReaction = await msg.reactions.cache
        .filter((r) => r.emoji.name === "🎉")
        .first()
        .fetch();
      await reaction.users.fetch();
      const winner: User = reaction.users.cache.filter((w) => !w.bot).random();

      const embed: MessageEmbed = msg.embeds[0];
      embed.setFooter("Giveaway ended at");
      embed.setColor(colors.error);
      embed.addField(
        "Winner",
        winner ? `${winner} (${winner.tag})` : "No one won :("
      );
      msg.edit(
        winner
          ? `${winner} won **${giveaway.item}**`
          : `No one won **${giveaway.item}** :(`,
        embed
      );
    } catch (e) {
      return;
    }
  },
};
