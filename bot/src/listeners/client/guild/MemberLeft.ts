import { Listener } from "discord-akairo";
import { GuildMember, TextChannel, MessageEmbed } from "discord.js";
import { getRandom, pluralify } from "../../../Utils";
import { colors } from "../../../Config";

export default class MemberLeftListener extends Listener {
  constructor() {
    super("memberLeft", {
      emitter: "client",
      event: "guildMemberRemove",
      category: "client",
    });
  }

  public async exec(member: GuildMember) {
    // tslint:disable-next-line: no-console
    console.log("discord.js", "{user} left {guild}", {
      user: member.user.tag,
      guild: member.guild.name,
    });
    if (
      this.client.settings.get(member.guild, "channels.memberLogs", null) !==
      null
    ) {
      const properties = {
        user: member.user.tag,
        guild: member.guild.name,
      };
      const channel = member.guild.channels.cache.get(
        this.client.settings.get(member.guild, "channels.memberLogs", null)
      );
      if (!channel) return;
      (channel as TextChannel).send(
        new MessageEmbed()
          .setColor(colors.error)
          .setFooter(
            `In other words, good bye ${member.user.tag
            }! Now there's only ${pluralify(
              member.guild.memberCount,
              "member"
            )} to enjoy ${member.guild.name}.\nAccount created at`
          )
          .setTimestamp(member.user.createdTimestamp)
          .setAuthor(
            `Member Left | ${member.guild.name}`,
            member.guild.iconURL({ dynamic: true })
          )
          .setDescription(
            getRandom(
              this.client.settings.get(member.guild, "messages.welcome", [
                "{user} is too lit, please nerf.",
                "{user} joined the party!",
              ])
            ).replace(
              new RegExp(`{(${Object.keys(properties).join("|")})}`, "g"),
              (match, property) => `**${properties[property] || ""}**`
            )
          )
      );
    }
  }
}
