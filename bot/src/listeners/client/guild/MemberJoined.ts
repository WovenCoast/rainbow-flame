import { Listener } from "discord-akairo";
import { GuildMember, TextChannel, MessageEmbed } from "discord.js";
import { getRandom } from "../../../Utils";
import { colors } from "../../../Config";

export default class MemberJoinedListener extends Listener {
  constructor() {
    super("memberJoined", {
      emitter: "client",
      event: "guildMemberAdd",
      category: "client",
    });
  }

  public async exec(member: GuildMember) {
    // tslint:disable-next-line: no-console
    console.log("discord.js", "{user} joined {guild}", {
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
          .setColor(colors.info)
          .setFooter(
            `In other words, welcome to ${member.guild.name}! You are the ${member.guild.memberCount}th member!\nAccount created at`
          )
          .setTimestamp(member.user.createdTimestamp)
          .setAuthor(
            `Member Joined | ${member.guild.name}`,
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
