import { Command } from "discord-akairo";
import Discord, { Message, MessageEmbed } from "discord.js";
import { performance } from "perf_hooks";
import os from "os";
import { colors } from "../../Config";
import { pluralify, convertBytes } from "../../Utils";

export default class SupportCommand extends Command {
  public constructor() {
    super("support", {
      aliases: ["support", "invite", "donate", "patreon", "vote", "upvote"],
      category: "Info",
      description: {
        content:
          "Help us out by inviting the bot or donating to us on patreon!",
        usage: "donate",
        examples: ["support"],
      },
      ratelimit: 5,
    });
  }

  public async exec(message: Message): Promise<Message> {
    return message.util.send(
      new MessageEmbed()
        .setColor(colors.info)
        .setFooter("Any support is well appreciated!")
        .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
        .setAuthor(`Help us out! | ${this.client.user.username}`)
        .setDescription(
          `RainbowFlame is a project with ambitious goals in mind, being able to do pretty much everything and anything that you would want all in one bot.\nIf you want to support our initiative, we would love it if you could give us an upvote or send us a donation with or without patreon!`
        )
        .addField(
          "Votes",
          `[Vultrex](https://vultrex.co/bot/697333942306603078): **${pluralify(
            (await this.client.apis.vultrex.fetchVotes()).length,
            "vote"
          )}**`
        )
    );
  }
}
