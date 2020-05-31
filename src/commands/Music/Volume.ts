import { Command } from "discord-akairo";
import { Message } from "discord.js";

import { FlameGuild } from "../../structures/discord.js/Guild";

export default class VolumeCommand extends Command {
  constructor() {
    super("volume", {
      aliases: ["volume", "v"],
      category: "Music",
      channel: "guild",
      description: {
        content: "Change the volume of music if playing any",
        usage: "volume [newVolume:number]",
        examples: ["volume", "volume 150"],
      },
      ratelimit: 3,
      args: [
        {
          id: "newVolume",
          type: "number",
          default: null,
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { newVolume }: { newVolume: number }
  ): Promise<any> {
    if (!(message.guild as FlameGuild).music.playing)
      return message.util.reply(
        "I need to be playing something to be able to change its volume!"
      );
    if (!newVolume)
      return message.util.send(
        `:loudspeaker: The current volume is **${
          (message.guild as FlameGuild).music.volume
        }%**`
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
    if (newVolume > 1000)
      return message.util.reply("you can set a maximum volume of 1000%!");
    (message.guild as FlameGuild).music.volume = newVolume;
    return message.util.send(
      `:white_check_mark: Successfully set the volume to **${newVolume}%**!`
    );
  }
}
