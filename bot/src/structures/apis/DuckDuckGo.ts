import { AkairoClient } from "discord-akairo";
import { URLSearchParams } from "url";
import axios from "axios";

interface InstantSearchResult {
  Abstract: string;
  AbstractText: string;
  AbstractSource: string;
  AbstractURL: string;
  Image: string;
  Heading: string;
  Answer: string;
  Redirect: string;
  AnswerType: string;
  Definition: string;
  DefinitionSource: string;
  DefinitionURL: string;
  RelatedTopics: {
    Result: string;
    FirstURL: string;
    Icon: string;
    URL: string;
    Height: number;
    Width: number;
    Text: string;
  }[];
  Results: {
    Result: string;
    FirstURL: string;
    Icon: string;
    URL: string;
    Height: number;
    Width: number;
    Text: string;
  }[];
  Type: string;
}
export class DuckDuckGoAPI {
  client: AkairoClient;
  constructor(client: AkairoClient) {
    this.client = client;
  }
  async searchInstant(query: string): Promise<InstantSearchResult | null> {
    try {
      return (
        await axios.get(
          `https://api.duckduckgo.com/?${new URLSearchParams({
            t: "RainbowFlame Discord",
            format: "json",
          }).toString()}&atb=v208-1&q=${query.replace(/\s/gi, "+")}`
        )
      ).data;
    } catch (e) {
      return null;
    }
  }
}
