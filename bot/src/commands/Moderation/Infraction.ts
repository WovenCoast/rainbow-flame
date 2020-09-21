import { Command } from "discord-akairo";
import { Message, MessageEmbed, GuildMember, User } from "discord.js";
import { Repository } from "typeorm";
import { Warn } from "../../models/Warn";
import { loading } from "../../Emojis";
import { colors } from "../../Config";
export default class InfractionCommand extends Command {
    constructor() {
        super("infractions", {
            aliases: ["infractions", "warns"],
            category: "Moderation",
            description: {
                content: "Check infractions of a member",
                usage: "infractions <member>",
                examples: [
                    "infractions @MindOfFlame#0001",
                    "infractions indOfFlame"
                ]
            },
            ratelimit: 3,
            userPermissions: ["MANAGE_MESSAGES"],
            args: [
                {
                    id: "member",
                    type: "member",
                    default: (msg: Message) => msg.member
                }
            ]
        });
    }
    public async exec(message: Message, { member }: { member: GuildMember }): Promise<Message> {
        const warnRepo: Repository<Warn> = this.client.db.getRepository(Warn);
        const warns: Warn[] = await warnRepo.find({
            user: member.id,
            guild: message.guild.id
        });
        const msg = await message.util.send(`Getting infractions... ${loading}`);
        if (!warns.length) return msg.edit(`:x: No infractions found for \`${member.user.tag}\`!`);
        const infractions = await Promise.all(warns.map(async (wn: Warn, i: number) => {
            const mod: User = await this.client.users.fetch(wn.moderator).catch(() => null);
            if (mod) return {
                index: i + 1,
                moderator: mod.tag,
                reason: wn.reason
            }
        }));

        return msg.edit(`:white_check_mark: Found infractions from \`${member.user.tag}\``, new MessageEmbed()
            .setAuthor(`Infractions | ${member.user.username}`, member.user.displayAvatarURL())
            .setColor(colors.info)
            .setDescription(infractions.map(v => `\`#${v.index}\` | Moderator: *${v.moderator}*\nReason: **\`${v.reason}\`**\n`))
        );
    }
}