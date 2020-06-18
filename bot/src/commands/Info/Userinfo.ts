import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed, UserFlags } from "discord.js";
import { colors } from "../../Config";
import { titleCase } from "../../Utils";
import {
  online,
  dnd,
  idle,
  offline,
  mobile,
  desktop,
  browser,
  discordEmployee,
  discordPartner,
  hypesquadEvents,
  bugHunter1,
  hypesquadBravery,
  hypesquadBrilliance,
  hypesquadBalance,
  earlySupporter,
  discord,
  bugHunter,
  verifiedBot,
  verifiedBotDeveloper,
} from "../../Emojis";

const statuses = {
  online: `${online} Online`,
  dnd: `${dnd} Do Not Disturb`,
  idle: `${idle} Idle`,
  offline: `${offline} Offline`,
};

const devices = {
  mobile: `${mobile} Mobile`,
  desktop: `${desktop} Desktop`,
  web: `${browser} Browser`,
};

const badges = {
  DISCORD_EMPLOYEE: `${discordEmployee} Discord Employee`,
  DISCORD_PARTNER: `${discordPartner} Discord Partner`,
  HYPESQUAD_EVENTS: `${hypesquadEvents} HypeSquad Events`,
  BUGHUNTER_LEVEL_1: `${bugHunter1} Bug Hunter Level 1`,
  HOUSE_BRAVERY: `${hypesquadBravery} HypeSquad Bravery`,
  HOUSE_BRILLIANCE: `${hypesquadBrilliance} HypeSquad Brilliance`,
  HOUSE_BALANCE: `${hypesquadBalance} HypeSquad Balance`,
  EARLY_SUPPORTER: `${earlySupporter} Early Supporter`,
  TEAM_USER: `Team User`,
  SYSTEM: `${discord} System`,
  BUGHUNTER_LEVEL_2: `${bugHunter} Bug Hunter Level 2`,
  VERIFIED_BOT: `${verifiedBot} Verified Bot`,
  VERIFIED_DEVELOPER: `${verifiedBotDeveloper} Verified Bot Developer`,
};

export default class UserinfoCommand extends Command {
  constructor() {
    super("userinfo", {
      aliases: ["userinfo", "whois"],
      category: "Info",
      description: {
        content: "View some information of a user",
        usage: "userinfo [member:string|Mention<User>]",
        examples: ["userinfo FlameXode"],
      },
      ratelimit: 3,
      args: [
        {
          id: "member",
          type: "member",
          default: (msg: Message) => msg.member,
        },
      ],
    });
  }

  public async exec(message: Message, { member }: { member: GuildMember }) {
    return message.util.send(
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(
          member.user.tag,
          member.user.displayAvatarURL({ dynamic: true })
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addField("User ID", member.user.id, true)
        .addField("Nickname", member.nickname || "`None`", true)
        .addField("Status", statuses[member.user.presence.status], true)
        .addField(
          "Devices",
          `${Object.keys(member.user.presence.clientStatus)
            .map((s) => devices[s])
            .join("\n")}` || "`None`",
          true
        )
        .addField(
          "Badges",
          Object.keys(UserFlags.FLAGS)
            .filter((f) => member.user.flags.has(UserFlags.FLAGS[f]))
            .map((flag) => badges[flag])
            .join("\n") || "`None`",
          true
        )
        .addField(
          "Roles",
          Array.from(member.roles.cache.values())
            .filter((r) => r.id !== message.guild.id)
            .sort((a, b) => b.position - a.position)
            .map((r) => r.toString())
            .join(" > ")
        )
    );
  }
}
