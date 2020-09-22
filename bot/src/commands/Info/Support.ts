import { Command } from "discord-akairo";
import Discord, { Message, MessageEmbed } from "discord.js";
import axios from "axios";
import cheerio from "cheerio";
import { colors } from "../../Config";
import { pluralify } from "../../Utils";

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
    // tslint:disable-next-line: radix
    const patreons = parseInt(
      cheerio
        .load((await axios.get("https://patreon.com/rainbowflame")).data)(
          "div.ZNIrZ>div:nth-child(1)>h2"
        )
        .text()
    );
    return message.util.send(
      new MessageEmbed()
        .setColor(colors.info)
        .setFooter("Any support is well appreciated!")
        .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
        .setAuthor(`Help us out! | ${this.client.user.username}`)
        .setDescription(
          `RainbowFlame is a project with ambitious goals in mind, being able to do pretty much everything and anything that you would want all in one bot.\nIf you want to support our initiative, we would love it if you could give us an upvote or pledge some amount on our patreon to keep our developers motivated and to maintain our hosting!`
        )
        .addField(
          "Votes",
          `[Vultrex](https://discordbots.co/bot/697333942306603078): **${pluralify(
            (await this.client.apis.vultrex.fetchVotes()).length,
            "vote"
          )}**`
        )
        .addField(
          "Donations",
          `[Patreon](https://patreon.com/rainbowflame): **${pluralify(
            patreons,
            "patreon"
          )}**`
        )
        .addField(
          "Invites",
          `[Bot Invite with no permissions](https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=0&scope=bot)\n[Server Invite](https://discord.gg/HwVsnDS)`
        )
    );
  }
}
