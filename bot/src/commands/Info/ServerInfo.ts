import { Command } from "discord-akairo";
import { Message, GuildMember, MessageEmbed, UserFlags } from "discord.js";
import { colors } from "../../Config";
import { pluralify, trimArray } from "../../Utils";
import {
  offline,
  idle,
  online,
  serverBoost,
  dnd,
  bot,
  human,
} from "../../Emojis";

const regions = {
  "us-west": ":flag_us: US West",
  "us-east": ":flag_us: US East",
  "us-central": ":flag_us: US Central",
  "us-south": ":flag_us: US South",
  "south-africa": ":flag_za: South Africa",
  "hong-kong": ":flag_hk: Hong Kong",
  singapore: ":flag_sg: Singapore",
  sydney: ":flag_au: Sydney",
  europe: ":flag_eu: Europe",
  brazil: ":flag_br: Brazil",
  russia: ":flag_ru: Russia",
  japan: ":flag_jp: Japan",
  india: ":flag_in: India",
};

const tiers = {
  0: "None",
  1: "Tier 1",
  2: "Tier 2",
  3: "Tier 3",
};

const verificationLevels = {
  NONE: "**None**: Unrestricted",
  LOW: "**Low**: Must have a verified email on their Discord account.",
  MEDIUM:
    "**Medium**: Must be registered on discord for longer than 5 minutes.",
  HIGH: "**High**: Must be a member of this server for longer than 10 minutes.",
  VERY_HIGH:
    "**Extreme**: Must have a verified phone on their Discord account.",
};

const filterLevels = {
  DISABLED: `${offline} Off`,
  MEMBERS_WITHOUT_ROLES: `${idle} No Role`,
  ALL_MEMBERS: `${online} Everyone`,
};

export default class ServerinfoCommand extends Command {
  constructor() {
    super("serverinfo", {
      aliases: ["serverinfo", "guildinfo", "guild"],
      category: "Info",
      description: {
        content: "View some information of the current guild",
        usage: "serverinfo",
        examples: ["serverinfo"],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message) {
    await message.guild.members.fetch();
    let emojis = Array.from(message.guild.emojis.cache.values())
      .sort((e1, e2) => e1.name.localeCompare(e2.name))
      .map((e) => e.toString());
    if (emojis.join("").length > 1024) {
      emojis = emojis.slice(
        0,
        emojis.indexOf(
          emojis.find(
            (e, i, arr) =>
              arr
                .slice(0, i)
                .map((emoji) => emoji.toString().length)
                .reduce((acc, value) => acc + value, 0) >= 950
          )
        )
      );
      emojis.push(
        ` and ${message.guild.emojis.cache.size - emojis.length} more...`
      );
    }

    let roles = Array.from(message.guild.roles.cache.values())
      .filter((r) => r.id !== message.guild.id)
      .sort((r1, r2) => r2.position - r1.position)
      .map((r) => r.toString());
    if (roles.join(" > ").length > 1024) {
      roles = [
        ...roles.filter(
          (r, i, arr) =>
            arr
              .slice(0, i)
              .map((role) => role.toString().length + 3)
              .reduce((acc, value) => acc + value, 0) -
              3 <=
            950
        ),
        message.guild.roles.cache.size - roles.length <= 0
          ? null
          : `${message.guild.roles.cache.size - roles.length} more...`,
      ].filter((r) => r !== null);
    }

    return message.util.send(
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setFooter("Server created at")
        .setTimestamp(message.guild.createdAt)
        .addField("Guild ID", message.guild.id, true)
        .addField(
          "Owner",
          `${message.guild.owner.user.toString()} (**${
            message.guild.owner.user.tag
          }**)`,
          true
        )
        .addField("Region", regions[message.guild.region], true)
        .addField(
          `Members (${pluralify(message.guild.members.cache.size, "member")})`,
          `${human} Humans: **${pluralify(
            message.guild.members.cache.filter((m) => !m.user.bot).size,
            "member"
          )}** | ${bot} Bots: **${pluralify(
            message.guild.members.cache.filter((m) => m.user.bot).size,
            "member"
          )}** | ${serverBoost} Boosting: **${pluralify(
            message.guild.members.cache.filter((m) => !!m.premiumSinceTimestamp)
              .size,
            "member"
          )}** | ${online} Online: **${pluralify(
            message.guild.members.cache.filter(
              (m) => m.user.presence.status === "online"
            ).size,
            "member"
          )}** | ${idle} Idle: **${pluralify(
            message.guild.members.cache.filter(
              (m) => m.user.presence.status === "idle"
            ).size,
            "member"
          )}** | ${dnd} Do Not Disturb: **${pluralify(
            message.guild.members.cache.filter(
              (m) => m.user.presence.status === "dnd"
            ).size,
            "member"
          )}** | ${offline} Offline: **${pluralify(
            message.guild.members.cache.filter(
              (m) => m.user.presence.status === "offline"
            ).size,
            "member"
          )}**`
        )
        .addField(
          `Channels (${pluralify(
            message.guild.channels.cache.size,
            "channel"
          )})`,
          `Text: **${pluralify(
            message.guild.channels.cache.filter((c) => c.type === "text").size,
            "channel"
          )}** | Voice: **${pluralify(
            message.guild.channels.cache.filter((c) => c.type === "voice").size,
            "channel"
          )}** | Category: **${pluralify(
            message.guild.channels.cache.filter((c) => c.type === "category")
              .size,
            "channel"
          )}** | News: **${pluralify(
            message.guild.channels.cache.filter((c) => c.type === "news").size,
            "channel"
          )}** | Store: **${pluralify(
            message.guild.channels.cache.filter((c) => c.type === "store").size,
            "channel"
          )}**`
        )
        .addField(
          "Verification Level",
          verificationLevels[message.guild.verificationLevel],
          true
        )
        .addField(
          "Explicit Content Filter Level",
          filterLevels[message.guild.explicitContentFilter],
          true
        )
        .addField(
          `Boost Tier (${pluralify(
            message.guild.premiumSubscriptionCount,
            "boost"
          )})`,
          `${serverBoost} ${tiers[message.guild.premiumTier]}`,
          true
        )
        .addField(
          `Roles (${pluralify(message.guild.roles.cache.size - 1, "role")})`,
          roles.join(" > ")
        )
        .addField(
          `Emojis (${pluralify(
            message.guild.emojis.cache.size,
            "emoji",
            "es"
          )})`,
          emojis.join("")
        )
    );
  }
}
