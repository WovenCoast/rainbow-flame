import { Command } from "discord-akairo";
import Discord, { Message, MessageEmbed } from "discord.js";
import { performance } from "perf_hooks";
import os from "os";
import { colors } from "../../Config";
import { pluralify, convertBytes } from "../../Utils";

export default class BotStatsCommand extends Command {
  public constructor() {
    super("botstats", {
      aliases: ["botstats", "stats", "info", "status", "botstat", "uptime"],
      category: "Info",
      description: {
        content: "View the stats for this bot",
        usage: "botstats",
        examples: ["botstats"],
      },
      ratelimit: 4,
    });
  }

  public async exec(message: Message): Promise<Message> {
    return message.util.send(
      new MessageEmbed()
        .setColor(colors.info)
        .setFooter("Bot online since")
        .setTimestamp(Date.now() - performance.now())
        .setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
        .setAuthor(`Bot Status | ${this.client.user.username}`)
        .addField(
          "Software Info",
          `${this.client.user.username}: **${this.client.version}**\nDiscord.js: **v${Discord.version}**\nNode: **v${process.versions.node}**\nv8: **v${process.versions.v8}**\nPlatform: \`${process.platform} (${process.arch})\``,
          true
        )
        .addField(
          "Specs List",
          `CPU: \`${os.cpus()[0].model}\`\nCores: **${pluralify(
            os.cpus().length,
            "core"
          )}**\nRAM Usage: \`${convertBytes(
            process.memoryUsage().heapUsed
          )} / ${convertBytes(os.totalmem())}\``,
          true
        )
        .addField(
          "Discord Stats",
          `Guilds: **${pluralify(
            this.client.guilds.cache.size,
            "guild"
          )}**\nHumans: **${pluralify(
            this.client.users.cache.filter((u) => !u.bot).size,
            "human"
          )}**\nBots: **${pluralify(
            this.client.users.cache.filter((u) => u.bot).size,
            "bot"
          )}**`,
          true
        )
        .addField(
          "Votes",
          `[Vultrex](https://discordbots.co/bot/697333942306603078): **${pluralify(
            (await this.client.apis.vultrex.fetchVotes()).length,
            "vote"
          )}**`
        )
    );
  }
}
