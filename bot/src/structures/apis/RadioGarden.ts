import axios from "axios";
import { AkairoClient } from "discord-akairo";

interface Station {
  locationCode: string;
  location: string;
  name: string;
  placeID: string;
  channelID: string;
}
export class RadioGardenAPI {
  client: AkairoClient;
  public constructor(client: AkairoClient) {
    this.client = client;
  }
  public async searchStations(search: string): Promise<Station[]> {
    const res = await axios.get(`http://radio.garden/api/search?q=${search}`);
    return res.data.hits.hits
      .map((s) => s._source)
      .filter((s) => s.type === "channel")
      .slice(0, 5)
      .map((s) => {
        return {
          locationCode: s.code as string,
          location: s.subtitle as string,
          name: s.title as string,
          placeID: s.placeId as string,
          channelID: s.channelId as string,
        } as Station;
      });
  }
  public async getSourceURL(station: Station): Promise<string> {
    return (
      await axios(
        `http://radio.garden/api/ara/content/listen/${station.channelID}/channel.mp3`,
        { method: "HEAD", headers: { Accept: "*/*" }, maxRedirects: 4 }
      )
    ).request.res.responseUrl;
  }
}
