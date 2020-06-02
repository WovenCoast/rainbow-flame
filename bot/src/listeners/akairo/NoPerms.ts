import { Listener, Command } from "discord-akairo";
import { Message, MessageEmbed, PermissionResolvable } from "discord.js";
import { colors, prefix } from "../../Config";
import { MissingPermissionSupplier } from "discord-akairo";
import { titleCase } from "../../Utils";

export default class NoPermsListener extends Listener {
  constructor() {
    super("noperms", {
      emitter: "commandHandler",
      event: "missingPermissions",
      category: "akairo",
    });
  }

  public async exec(
    msg: Message,
    cmd: Command,
    type: "client" | "user",
    missingPerms: Array<PermissionResolvable | MissingPermissionSupplier>
  ) {
    msg.util.send(
      new MessageEmbed()
        .setTimestamp()
        .setColor(colors.error)
        .setDescription(
          `To evaluate \`${prefix} ${cmd.id}\`, ${
            type === "client" ? "I" : "you"
          } need these permissions:- \n${missingPerms
            .map((p) => `\`${titleCase(p.toString().replaceAll("_", " "))}\``)
            .join(", ")}`
        )
    );
  }
}
