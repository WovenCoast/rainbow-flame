import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import axios from "axios";
import cheerio from "cheerio";
import { performance } from "perf_hooks";
import { convertMs } from "../../Utils";
import { loading } from "../../Emojis";
import { colors } from "../../Config";

export default class MinecraftPlayerInfo extends Command {
  public constructor() {
    super("minecraft-player-info", {
      aliases: [
        "minecraft-player-info",
        "minecraft-playerinfo",
        "mc-player-info",
        "mc-playerinfo",
        "mc-pi",
        "mc-userinfo",
        "mc-user-info",
        "mc-ui",
      ],
      category: "Minecraft",
      description: {
        content: "Find information about a player in Minecraft",
        usage: "minecraft-player-info",
        examples: ["minecraft-player-info FlameXode"],
      },
      args: [
        {
          id: "player",
          type: "string",
          prompt: {
            start: (msg: Message) =>
              `you need to provide a username or a UUID!`,
          },
        },
      ],
      ratelimit: 3,
    });
  }

  public async exec(
    message: Message,
    { player }: { player: string }
  ): Promise<any> {
    const msg = await message.util.send(
      `${loading} Finding user information...`
    );
    const requestTimeStart = performance.now();
    const playerInfo = await this.client.apis.minecraft.getPlayerInfo(player);
    const requestTime = performance.now() - requestTimeStart;
    if (playerInfo.error)
      return msg.edit(
        `:x: Couldn't find player info, \`${playerInfo.message}\` :(`
      );
    return await msg.edit(
      `:white_check_mark: Successfully found information about **${playerInfo.username}**!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(`Player Info | ${playerInfo.username}`, playerInfo.headImage)
        .setThumbnail(playerInfo.bodyImage)
        .setDescription(
          `[Download Skin](https://minotar.net/skin/${playerInfo.rawUuid})`
        )
        .addField("Username", playerInfo.username, true)
        .addField("UUID", playerInfo.uuid, true)
        .addField(
          "Name History",
          playerInfo.nameHistory
            .map(
              (h) =>
                `**${h.name}**${
                  !h.changedToAt
                    ? ""
                    : `, changed at \`${convertMs(
                        Date.now() - h.changedToAt
                      )} ago\``
                }`
            )
            .reverse()
            .join("\n")
        )
        .setFooter(`Fetched information in ${convertMs(requestTime)}`)
    );
  }
}
