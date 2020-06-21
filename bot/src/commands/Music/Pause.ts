import { Command } from "discord-akairo";
import { Message } from "discord.js";
import ms from "ms";
import { convertDuration } from "../../Utils";

import { FlameGuild } from "../../structures/discord.js/Guild";

export default class PauseCommand extends Command {
  constructor() {
    super("pause", {
      aliases: ["pause", "resume"],
      category: "Music",
      channel: "guild",
      description: {
        content: "Pause or resume the current music",
        usage: "pause",
        examples: ["pause"],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<any> {
    if (!(message.guild as FlameGuild).music.playing)
      return message.util.reply(
        "I need to be playing something to be able to change its volume!"
      );
    if (
      !(
        (message.guild as FlameGuild).music.voiceChannel.members.size <= 2 ||
        message.member.permissions.has("PRIORITY_SPEAKER")
      )
    )
      return message.util.reply(
        "you need to be alone or have `PRIORITY_SPEAKER` for this command to work!"
      );
    (message.guild as FlameGuild).music.pause();
    return message.util.send(
      `:white_check_mark: Successfully ${
        (message.guild as FlameGuild).music.player.paused ? "paused" : "resumed"
      } the music!`
    );
  }
}
