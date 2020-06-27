import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { loading } from "../../Emojis";
import { colors } from "../../Config";

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
        .addField("Cases", data.cases, true)
        .addField("Active Cases", data.active, true)
        .addField("Critical Cases", data.critical, true)
        .addField("Tests", data.tests || "Unknown", true)
        .addField(
          "Positive Tests Rate",
          data.tests == 0
            ? "Unknown"
            : `${(data.tests / data.cases).toFixed(2)}%`,
          true
        )
        .addField("Deaths", data.deaths, true)
        .addField("Cases Today", data.todayCases, true)
        .addField("Deaths Today", data.todayDeaths, true)
        .addField("Recovered", data.recovered, true)
        .addField(
          "Cases Per Million",
          data.casesPerOneMillion || "Unknown",
          true
        )
        .addField(
          "Deaths Per Million",
          data.deathsPerOneMillion || "Unknown",
          true
        )
        .addField(
          "Tests Per Million",
          data.testsPerOneMillion || "Unknown",
          true
        )
        .setFooter(`Last Updated: ${data.updated.format("DD/MMM/YYYY hh:mm")}`)
    );
  }
}
