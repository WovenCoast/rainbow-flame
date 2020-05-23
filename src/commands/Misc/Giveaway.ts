import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import ms from "ms";

import { Repository } from "typeorm";
import { Giveaway } from "../../models/Giveaway";
import GiveawayManager from "../../structures/giveaways/GiveawayManager";
import { colors } from "../../Config";

export default class GiveawayCommand extends Command {
  public constructor() {
    super("giveaway", {
      aliases: ["giveaway"],
      category: "Misc",
      description: {
        content: "Start a giveaway in your server",
        usage: "giveaway {time} [item]",
        examples: ["giveaway 10m Discord Nitro"],
      },
      ratelimit: 3,
      args: [
        {
          id: "time",
          type: (msg: Message, str: string) => (str ? Number(ms(str)) : null),
          prompt: {
            start: (msg: Message) =>
              `you need to provide a time duration for the giveaway!`,
            retry: (msg: Message) =>
              `you need to provide a valid time duration for the giveaway!`,
          },
        },
        {
          id: "item",
          type: "string",
          match: "rest",
          prompt: {
            start: (msg: Message) =>
              `${msg.author}, you need to provide an item to giveaway!`,
          },
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { time, item }: { time: number; item: string }
  ): Promise<any> {
    const giveawayRepo: Repository<Giveaway> = this.client.db.getRepository(
      Giveaway
    );
    const end: number = Date.now() + time;

    const msg: Message = await message.channel.send(
      new MessageEmbed()
        .setAuthor(
          `Giveaway | ${item}`,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setColor(colors.info)
        .setDescription(`**${message.author}** is giving away **${item}**!`)
        .setFooter("Giveaway ends at")
        .setTimestamp(end)
    );
    msg.react("🎉");

    giveawayRepo.insert({
      channel: msg.channel.id,
      message: msg.id,
      item,
      end,
    });
    setTimeout(() => {
      GiveawayManager.end(giveawayRepo, msg);
    }, time);
  }
}
