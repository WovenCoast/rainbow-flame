import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed, PermissionResolvable } from "discord.js";
import { colors, prefix } from "../../Config";
import { MissingPermissionSupplier } from "discord-akairo";
import { titleCase } from "../../Utils";

export default class InhibitorBlockListener extends Listener {
  constructor() {
    super("inhibitorblock", {
      emitter: "commandHandler",
      event: "commandBlocked",
      category: "akairo",
    });
  }

  public async exec(msg: Message, cmd: Command, reason: string) {
    if (["owner", "guild", "dm"].includes(reason))
      reason = `this command is ${reason} only`;
    console.log(
      "akairo",
      "{command} executed by {user} got blocked because {reason}",
      { user: msg.author.tag, command: cmd.id, reason }
    );
    msg.util.send(
      new MessageEmbed()
        .setFooter(`${cmd.id} executed by ${msg.author.tag} blocked`, msg.guild.iconURL({ dynamic: true })).setTimestamp()
        .setColor(colors.error)
        .setAuthor(`Command Blocked | ${cmd.id}`, msg.author.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `You cannot execute **${cmd.id}** because **${reason}**`
        )
    );
  }
}
