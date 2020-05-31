import axios from "axios";
import { AkairoClient } from "discord-akairo";

export class HasteAPI {
  client: AkairoClient;
  constructor(client: AkairoClient) {
    this.client = client;
  }
  public async get(url: string): Promise<string> {
    const rawURLElements: string[] = url
      .substring(url.indexOf("/") + 2, url.length)
      .split("/");
    if (rawURLElements.indexOf("raw") !== -1)
      rawURLElements.splice(1, 0, "raw");
    return await axios.get(
      url.substring(0, url.indexOf("/") + 2) + rawURLElements.join("/")
    );
  }
  public async post(
    text: string,
    haste: string,
    extension: string = "log"
  ): Promise<string> {
    return await axios
      .post(`${haste}${haste.endsWith("/") ? "" : "/"}documents`, text)
      .then(
        (res) =>
          `${haste}${haste.endsWith("/") ? "" : ""}${res.data.key}${
            extension.trim() === "" ? "" : "."
          }${extension}`
      );
  }
}
