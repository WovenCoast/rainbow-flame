import { Command } from "discord-akairo";
import { Message, MessageAttachment, GuildMember } from "discord.js";
import { createCanvas, loadImage, Image, Canvas } from "canvas";
import { join } from "path";
import { convertMs, getRandom } from "../../Utils";
import { loading } from "../../Emojis";
import { Rank } from "../../models/Rank";
import { colors } from "../../Config";

function degToRad(deg: number): number {
  return (deg / 360) * (Math.PI * 2);
}
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | { tl?: number; tr?: number; br?: number; bl?: number } = 5,
  fill: boolean = false,
  stroke: boolean = true
) {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    radius = Object.assign({ tl: 0, tr: 0, br: 0, bl: 0 }, radius);
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
function getFromValue<V>(arr: Array<V>, value: number, maxValue: number): V {
  return arr[Math.floor(arr.length * (value / maxValue))];
}
function clampDown(value: number, minValue: number) {
  if (value < minValue) return minValue;
  return value;
}
function clampUp(value: number, maxValue: number) {
  if (value > maxValue) return maxValue;
  return value;
}

export default class RankCommand extends Command {
  public constructor() {
    super("rank", {
      aliases: ["rank", "r", "level"],
      category: "Levels",
      description: {
        content: "Check the rank of you or someone else",
        usage: "rank",
        examples: ["rank", "rank FlameXode"],
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

  public async exec(
    message: Message,
    { member }: { member: GuildMember }
  ): Promise<any> {
    const msg = await message.util.send(`${loading} Searching for rank...`);
    const rankRepo = this.client.db.getRepository(Rank);
    const rank = await rankRepo.findOne({
      guild: message.guild.id,
      user: member.user.id,
    });
    if (!rank) return msg.edit(`:x: That person doesn't have a rank!`);
    const ranks = (
      await rankRepo.find({ guild: message.guild.id })
    ).sort((a, b) => (a.level === b.level ? b.xp - a.xp : b.level - a.level));

    const canvas = createCanvas(1000, 300);
    await msg.edit(`${loading} Painting rank card...`);
    const background = await loadImage(
      join(process.cwd(), "assets", getRandom(["background1.jpeg"]))
    );
    await this.generateRankCard(canvas, {
      level: rank.level,
      xp: rank.xp,
      background,
      rank:
        ranks.indexOf(
          ranks.find((r) => r.guild === rank.guild && r.user === rank.user)
        ) + 1,
      multiplier: 50,
      tag: member.user.tag,
      avatar: member.user.displayAvatarURL({ format: "jpg", size: 256 }),
    });
    await Promise.all([
      message.channel.send(
        `Rank information of **${member.user.tag}**`,
        new MessageAttachment(canvas.toBuffer())
      ),
      msg.delete(),
    ]);
  }

  private async generateRankCard(
    canvas: Canvas,
    levelData: {
      xp: number;
      level: number;
      rank: number;
      multiplier: number;
      tag: string;
      avatar: string;
      background: Image;
    }
  ) {
    /** @type {CanvasRenderingContext2D} */
    const ctx = canvas.getContext("2d");
    const avatar = await loadImage(levelData.avatar);
    const banner = await loadImage(
      join(process.cwd(), "assets", "rainbow-flame-banner.png")
    );
    const primaryColor = getFromValue(
      ["#c7ceea", "#b5ead7", "#ffdac1", "#ff9aa2"],
      levelData.xp,
      levelData.level * levelData.multiplier
    );
    ctx.drawImage(levelData.background, 0, 0, 1000, 300);
    ctx.fillStyle = ctx.createPattern(banner, "no-repeat");
    ctx.fillRect(0, 0, 15, 300);
    ctx.fillRect(0, 0, 1000, 15);
    ctx.fillRect(1000 - 15, 0, 15, 300);
    ctx.fillRect(0, 300 - 15, 1000, 15);

    ctx.globalAlpha = 0.4;
    ctx.fillRect(15, 15, 110, 270);

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    roundRect(ctx, 160, 217 - 20, 790, 65, { br: 5, bl: 5 }, true, false);
    ctx.font = "45px Ubuntu";
    roundRect(
      ctx,
      940 - ctx.measureText(`#${levelData.rank}`).width,
      170 - 20,
      ctx.measureText(`#${levelData.rank}`).width + 10,
      50,
      { tr: 5, tl: 5 },
      true,
      false
    );
    ctx.globalAlpha = 1;
    ctx.fillStyle = primaryColor;
    roundRect(
      ctx,
      160,
      220 - 20,
      (levelData.xp / (levelData.level * levelData.multiplier)) * 790,
      33,
      0,
      true,
      false
    );

    ctx.textBaseline = "top";
    ctx.font = "25px Fira Code";
    ctx.strokeStyle = primaryColor;
    ctx.fillStyle = primaryColor;
    ctx.lineWidth = 1.3;
    ctx.fillText(levelData.level.toString(), 173, 256 - 20);
    ctx.strokeText(levelData.level.toString(), 173, 256 - 20);
    ctx.textAlign = "right";
    ctx.fillText((levelData.level + 1).toString(), 937, 256 - 20);
    ctx.strokeText((levelData.level + 1).toString(), 937, 256 - 20);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.lineWidth = 5;
    roundRect(
      ctx,
      173 + (ctx.measureText(levelData.level.toString()).width + 5),
      270 - 20,
      760 -
        ctx.measureText((levelData.level + 1).toString()).width -
        (ctx.measureText(levelData.level.toString()).width + 5),
      5,
      2,
      true,
      false
    );
    ctx.fillStyle = primaryColor;
    roundRect(
      ctx,
      173 + (ctx.measureText(levelData.level.toString()).width + 5),
      270 - 20,
      (levelData.xp / (levelData.level * levelData.multiplier)) *
        (760 -
          ctx.measureText((levelData.level + 1).toString()).width -
          (ctx.measureText(levelData.level.toString()).width + 5)),
      5,
      2,
      true,
      false
    );

    ctx.font = "40px Ubuntu";
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.4;
    roundRect(
      ctx,
      120,
      49 - 7,
      clampUp(ctx.measureText(levelData.tag).width + 70, 1000 - 110 - 20),
      45,
      5,
      true,
      false
    );

    const text = `Remaining ${
      levelData.level * levelData.multiplier - levelData.xp
    } XP`;
    ctx.textAlign = "left";
    ctx.font = "27px Ubuntu";
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "black";
    roundRect(
      ctx,
      160,
      186 - 20,
      ctx.measureText(text).width + 10,
      34,
      { tr: 5, tl: 5 },
      true,
      false
    );
    ctx.globalAlpha = 1;
    ctx.fillStyle = primaryColor;
    ctx.fillText(text, 165, 188 - 20);
    ctx.strokeText(text, 165, 188 - 20);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.fillText("Remaining ", 165, 188 - 20);
    ctx.fillText(
      "XP",
      165 +
        ctx.measureText(
          `Remaining ${levelData.level * levelData.multiplier - levelData.xp} `
        ).width,
      188 - 20
    );

    ctx.font = "40px Ubuntu";
    ctx.fillStyle = "white";
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
    ctx.fillText(levelData.tag.split("#")[0], 185, 52 - 10, 826 - 20);
    ctx.strokeStyle = "white";
    ctx.globalAlpha = 1;
    ctx.lineWidth = 0.3;
    ctx.strokeText(levelData.tag.split("#")[0], 185, 52 - 10, 826 - 20);
    ctx.fillStyle = primaryColor;
    ctx.fillText(
      `#${levelData.tag.split("#")[1]}`,
      185 + ctx.measureText(levelData.tag.split("#")[0]).width,
      52 - 10
    );

    ctx.font = "45px Ubuntu";
    ctx.fillStyle = primaryColor;
    ctx.textAlign = "right";
    ctx.fillText(
      "#",
      945 - ctx.measureText(levelData.rank.toString()).width,
      173 - 20
    );
    ctx.fillStyle = "white";
    ctx.fillText(levelData.rank.toString(), 945, 173 - 20);

    ctx.font = "29px Ubuntu";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.textAlign = "left";
    ctx.lineWidth = 0.3;
    ctx.fillText(`${levelData.xp} XP`, 500, 220 - 20);
    ctx.strokeText(`${levelData.xp} XP`, 500, 220 - 20);
    ctx.textAlign = "right";
    ctx.fillText(
      `${levelData.level * levelData.multiplier} XP`,
      156 + 790,
      220 - 20
    );
    ctx.strokeText(
      `${levelData.level * levelData.multiplier} XP`,
      156 + 790,
      220 - 20
    );

    const radius = 64;
    ctx.fillStyle = ctx.createPattern(avatar, "no-repeat");
    ctx.strokeStyle = "white";
    ctx.globalAlpha = 1;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(50 + radius, 50 - 7 + radius, radius, degToRad(-90), degToRad(90));
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.strokeStyle = primaryColor;
    ctx.arc(50 + radius, 50 - 7 + radius, radius, degToRad(90), degToRad(-90));
    ctx.stroke();
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.arc(50 + radius, 50 - 7 + radius, radius, 0, degToRad(360));
    ctx.save();
    ctx.clip();
    ctx.drawImage(avatar, 50, 50 - 7, 128, 128);
  }
}
