import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { performance } from "perf_hooks";
import { convertMs, pluralify } from "../../Utils";
import { loading } from "../../Emojis";
import { colors } from "../../Config";
import { MessageAttachment } from "discord.js";

export default class MinecraftServerInfo extends Command {
  public constructor() {
    super("minecraft-server-info", {
      aliases: [
        "minecraft-server-info",
        "minecraft-serverinfo",
        "mc-server-info",
        "mc-serverinfo",
        "mc-si",
        "mc-servinfo",
        "mc-serv-info",
      ],
      category: "Minecraft",
      description: {
        content: "Find information about a server in Minecraft",
        usage: "minecraft-server-info",
        examples: ["minecraft-server-info mc.wovencoast.me"],
      },
      args: [
        {
          id: "server",
          type: "string",
          prompt: {
            start: (msg: Message) =>
              `you need to provide a server IP or a domain!`,
          },
        },
      ],
      ratelimit: 3,
    });
  }

  public async exec(
    message: Message,
    { server }: { server: string }
  ): Promise<any> {
    const msg = await message.util.send(
      `${loading} Finding server information...`
    );
    const requestTimeStart = performance.now();
    const serverInfo = await this.client.apis.minecraft.getServerInfo(server);
    const requestTime = performance.now() - requestTimeStart;
    if (serverInfo.error)
      return msg.edit(
        `:x: Couldn't find server info, \`${serverInfo.message}\` :(`
      );
    if (!serverInfo.online) return msg.edit(`:x: That server is not online!`);
    return await msg.edit(
      `:white_check_mark: Successfully found information about **${serverInfo.ip}**!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setAuthor(`Server Info | ${serverInfo.ip}`, serverInfo.icon)
        .setThumbnail(serverInfo.icon)
        .addField(
          "Players",
          `Online: **${pluralify(
            serverInfo.onlinePlayers,
            "player"
          )}** | Max: **${pluralify(serverInfo.maxPlayers, "player")}**`,
          true
        )
        .addField("Server Type", serverInfo.type, true)
        .addField(
          "MOTD (Message Of The Day)",
          `\`\`\`\n${serverInfo.motd}\`\`\``
        )
        .setImage(
          `http://status.mclive.eu/${server}/${serverInfo.host}/${serverInfo.port}/banner.png`
        )
        .setFooter(`Fetched information in ${convertMs(requestTime)}`)
    );
  }
}
