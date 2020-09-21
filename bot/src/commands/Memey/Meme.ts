import { Command } from "discord-akairo";
import { loading } from "../../Emojis";
import { Message, MessageEmbed } from "discord.js";
import gotreq from "got";
import { colors } from "../../Config";
export default class MemeCommand extends Command {
    constructor() {
        super("meme", {
            aliases: ["meme", "redditmeme"],
            category: "Memey",
            description: {
                content: "Get some memes that will make you laugh hard.",
                usage: "meme",
                examples: ["meme"]
            },
            ratelimit: 5,
        });
    }
    public async exec(message: Message): Promise<Message> {
        const msg = await message.util.send(`Finding Memes ${loading}`);
        const embed = new MessageEmbed();
        gotreq("https://www.reddit.com/r/memes/random/.json").then(res => {
            const content = JSON.parse(res.body);
            const link = content[0].data.children[0].data.permalink;
            const Url = `https://reddit.com${link}`;
            const ImageURL = content[0].data.children[0].data.url;
            const Title = content[0].data.children[0].data.title;
            const Upvotes = content[0].data.children[0].data.ups;
            const Comments = content[0].data.children[0].data.num_comments;
            embed.setTitle(`${Title}`)
            embed.setURL(`${Url}`)
            embed.setImage(ImageURL)
            embed.setColor(colors.secondary)
            embed.setFooter(`👍 ${Upvotes.toLocaleString()} | 💬 ${Comments.toLocaleString()}`); msg.edit(embed);
            return msg.edit("");
        });
        return;
    }
}