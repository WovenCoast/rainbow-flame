import { Command } from "discord-akairo";
import { Message } from "discord.js";
import { FlameGuild } from "../../structures/discord.js/Guild";
import { PlayerEqualizerBand } from "lavacord";

const presets = {
  bass: [
    {
      band: 0,
      gain: 0.15,
    },
    {
      band: 1,
      gain: 0.25,
    },
    {
      band: 2,
      gain: 0.15,
    },
    {
      band: 3,
      gain: 0.05,
    },
    {
      band: 4,
      gain: -0.05,
    },
    {
      band: 5,
      gain: -0.1,
    },
    {
      band: 6,
      gain: -0.15,
    },
    {
      band: 7,
      gain: -0.1,
    },
    {
      band: 8,
      gain: -0.05,
    },
  ],
};

export default class EqualizerCommand extends Command {
  constructor() {
    super("equalizer", {
      aliases: ["equalizer", "equaliser", "eq"],
      category: "Music",
      ratelimit: 2,
      args: [
        {
          id: "preset",
          type: Object.keys(presets),
          prompt: {
            start: (msg: Message) =>
              `you need to say the name of a preset! This can be one of ${Object.keys(
                presets
              )
                .map((e) => `\`${e}\``)
                .join(",")}`,
          },
          // default: null,
        },
        {
          id: "multiplier",
          type: (msg: Message, str: string) =>
            str &&
            !isNaN(new Number(str) as number) &&
            parseFloat(str) > 0 &&
            parseFloat(str) < 10
              ? parseFloat(str)
              : null,
          default: 1,
          flag: ["-m=", "--m=", "--multiplier=", "--mult="],
        },
      ],
      userPermissions: (msg: Message) => {
        if (!(msg.guild as FlameGuild).music.playing) return "MUSIC_PLAYING";
      },
    });
  }
  public async exec(
    message: Message,
    { preset, multiplier }: { preset: string; multiplier: number }
  ): Promise<any> {
    if (!(message.guild as FlameGuild).music.playing)
      return await message.util.reply(
        "I can't change the equalizer of a track I'm not playing!"
      );
    if (!preset) {
      return;
    } else {
      (message.guild as FlameGuild).music.player.equalizer = presets[
        preset.toLowerCase()
      ].map((e) => {
        e.gain = e.gain * multiplier;
        return e;
      });
      return await message.util.send(
        `:white_check_mark: Successfully set the music equalizer to \`${preset}\`${
          multiplier !== 1 ? `with an x${multiplier} gain` : ""
        }!`
      );
    }
  }
}
