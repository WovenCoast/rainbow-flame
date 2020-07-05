import axios from "axios";
import { AkairoClient } from "discord-akairo";

interface WordInfo {
  definition: string;
  link: string;
  thumbsUp: number;
  thumbsDown: number;
  example: string;
  term: string;
  author: string;
}
export class UrbanAPI {
  client: AkairoClient;
  constructor(client: AkairoClient) {
    this.client = client;
  }
  async getWordInfo(word: string): Promise<WordInfo[]> {
    const res = await axios.get(
      `http://api.urbandictionary.com/v0/define?page=1&term=${encodeURIComponent(
        word
      )}`
    );
    return res.data.list.map((w) => {
      return {
        author: w.author,
        definition: w.definition.replace(
          new RegExp(
            `{(${w.definition
              .split(/(\[|\])/gi)
              .filter((w, i) => i % 2 === 0)
              .filter((w, i) => i % 2 === 1)
              .join("|")})}`,
            "g"
          ),
          (match, property) =>
            `[${property}](https://www.urbandictionary.com/define.php?term=${encodeURIComponent(
              property
            )})`
        ),
        example: w.example.replace(
          new RegExp(
            `{(${w.example
              .split(/(\[|\])/gi)
              .filter((w, i) => i % 2 === 0)
              .filter((w, i) => i % 2 === 1)
              .join("|")})}`,
            "g"
          ),
          (match, property) =>
            `[${property}](https://www.urbandictionary.com/define.php?term=${encodeURIComponent(
              property
            )})`
        ),
        link: w.permalink,
        term: w.word,
        thumbsDown: w["thumbs_down"],
        thumbsUp: w["thumbs_up"],
      } as WordInfo;
    });
  }
}
