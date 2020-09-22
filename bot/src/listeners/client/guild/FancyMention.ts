import { Listener, AkairoClient } from "discord-akairo";
import { Message } from "discord.js";
import { prefix } from "../../../Config";

export default class FancyMentionListener extends Listener {
  constructor() {
    super("fancymention", {
      emitter: "client",
      event: "message",
      category: "client",
    });
  }

  public async exec(message: Message) {
    if (
      [`<@${this.client.user.id}>`, `<@!${this.client.user.id}>`].includes(
        message.content.trim()
      )
    )
      return message.reply(
        `hey there! My prefix is \`${prefix}\`, take a look in \`${prefix} help\` to see what you can do with me!`
      );
  }
}
