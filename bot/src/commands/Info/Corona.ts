import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { loading } from "../../Emojis";
import { colors } from "../../Config";
import { pluralify } from "../../Utils";

export default class CoronaCommand extends Command {
  constructor() {
    super("corona", {
      aliases: ["corona", "covid19", "covid-19", "covid"],
      category: "Info",
      description: {
        content: "Find information about corona cases",
        usage: "corona [country:string]",
        examples: ["corona", "corona United States"],
      },
      ratelimit: 2,
      args: [
        {
          id: "country",
          type: "string",
          match: "rest",
          default: "global",
        },
      ],
    });
  }

  public async exec(
    message: Message,
    { country }: { country: string }
  ): Promise<Message> {
    const msg = await message.util.send(`${loading} Searching...`);
    const data = await this.client.apis.corona.country(country, true);
    return await msg.edit(
      `:white_check_mark: Successfully found information about \`${data.country}\`!`,
      new MessageEmbed()
        .setColor(colors.info)
        .setThumbnail(data.countryInfo.flag)
        .setAuthor(`Corona Info | ${data.country}`, data.countryInfo.flag)
        .addField(
          "Location:",
          `${data.countryInfo.lat} Lat | ${data.countryInfo.long} Long`
        )
        .addField("Cases", pluralify(data.cases, "case"), true)
        .addField("Active Cases", pluralify(data.active, "case"), true)
        .addField("Critical Cases", pluralify(data.critical, "case"), true)
        .addField("Tests", pluralify(data.tests, "test"), true)
        .addField(
          "Positive Tests Rate",
          data.tests == 0
            ? "Unknown"
            : `${(data.tests / data.cases).toFixed(2)}%`,
          true
        )
        .addField("Deaths", pluralify(data.deaths, "death"), true)
        .addField("Cases Today", pluralify(data.todayCases, "case"), true)
        .addField("Deaths Today", pluralify(data.todayDeaths, "death"), true)
        .addField("Recovered", pluralify(data.recovered, "case"), true)
        .addField(
          "Cases Per Million",
          pluralify(Math.round(data.casesPerOneMillion), "case"),
          true
        )
        .addField(
          "Deaths Per Million",
          pluralify(Math.round(data.deathsPerOneMillion), "death"),
          true
        )
        .addField(
          "Tests Per Million",
          pluralify(Math.round(data.testsPerOneMillion), "test"),
          true
        )
        .setFooter(`Last Updated: ${data.updated.format("DD/MMM/YYYY hh:mm")}`)
    );
  }
}
