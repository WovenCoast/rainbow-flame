import { AkairoClient } from "discord-akairo";
import axios from "axios";
import moment, { Moment } from "moment";

interface Country {
  updated: Moment;
  country: string;
  countryInfo: {
    _id: number;
    iso2: string;
    iso3: string;
    lat: number;
    long: number;
    flag: string;
  };
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  todayRecovered: number;
  active: number;
  critical: number;
  casesPerOneMillion: number;
  deathsPerOneMillion: number;
  tests: number;
  testsPerOneMillion: number;
  population: number;
  continent: string;
  oneCasePerPeople: number;
  oneDeathPerPeople: number;
  oneTestPerPeople: number;
  activePerOneMillion: number;
  recoveredPerOneMillion: number;
  criticalPerOneMillion: number;
}
export class CoronaAPI {
  client: AkairoClient;
  constructor(client: AkairoClient) {
    this.client = client;
  }
  async allCountries(): Promise<Country[] | null> {
    try {
      return (
        await axios.get("https://corona.lmao.ninja/v2/countries")
      ).data.map((c) => {
        c.updated = moment(c.updated);
        return c;
      });
    } catch (e) {
      return null;
    }
  }
  async country(
    country: string,
    fallbackToGlobal: boolean = false
  ): Promise<Country> {
    if (!country) return fallbackToGlobal ? await this.global() : null;
    const data = await this.allCountries();
    return (
      data.find(
        (c) =>
          (c.countryInfo.iso2 || "").toLowerCase() === country.toLowerCase()
      ) ||
      data.find(
        (c) =>
          (c.countryInfo.iso3 || "").toLowerCase() === country.toLowerCase()
      ) ||
      data.find(
        (c) => (c.country || "").toLowerCase() === country.toLowerCase()
      ) ||
      (fallbackToGlobal ? await this.global() : null)
    );
  }
  async global(): Promise<Country> {
    const data = await this.allCountries();
    return {
      active: data.map((c) => c.active).reduce((acc, cur) => acc + cur, 0),
      activePerOneMillion: data
        .map((c) => c.activePerOneMillion)
        .reduce((acc, cur) => acc + cur, 0),
      cases: data.map((c) => c.cases).reduce((acc, cur) => acc + cur, 0),
      casesPerOneMillion: data
        .map((c) => c.casesPerOneMillion)
        .reduce((acc, cur) => acc + cur, 0),
      continent: "Global",
      country: "Earth",
      countryInfo: {
        _id: 0,
        iso2: "GL",
        iso3: "GLO",
        flag: "https://www.gstatic.com/earth/00-favicon.ico",
        lat: 0,
        long: 0,
      },
      critical: data.map((c) => c.critical).reduce((acc, cur) => acc + cur, 0),
      criticalPerOneMillion: data
        .map((c) => c.criticalPerOneMillion)
        .reduce((acc, cur) => acc + cur, 0),
      deaths: data.map((c) => c.deaths).reduce((acc, cur) => acc + cur, 0),
      deathsPerOneMillion: data
        .map((c) => c.deathsPerOneMillion)
        .reduce((acc, cur) => acc + cur, 0),
      oneCasePerPeople: data
        .map((c) => c.oneCasePerPeople)
        .reduce((acc, cur) => acc + cur, 0),
      oneDeathPerPeople: data
        .map((c) => c.oneDeathPerPeople)
        .reduce((acc, cur) => acc + cur, 0),
      oneTestPerPeople: data
        .map((c) => c.oneTestPerPeople)
        .reduce((acc, cur) => acc + cur, 0),
      population: data
        .map((c) => c.population)
        .reduce((acc, cur) => acc + cur, 0),
      recovered: data
        .map((c) => c.recovered)
        .reduce((acc, cur) => acc + cur, 0),
      recoveredPerOneMillion: data
        .map((c) => c.recoveredPerOneMillion)
        .reduce((acc, cur) => acc + cur, 0),
      tests: data.map((c) => c.tests).reduce((acc, cur) => acc + cur, 0),
      testsPerOneMillion: data
        .map((c) => c.testsPerOneMillion)
        .reduce((acc, cur) => acc + cur, 0),
      todayCases: data
        .map((c) => c.todayCases)
        .reduce((acc, cur) => acc + cur, 0),
      todayDeaths: data
        .map((c) => c.todayDeaths)
        .reduce((acc, cur) => acc + cur, 0),
      todayRecovered: data
        .map((c) => c.todayRecovered)
        .reduce((acc, cur) => acc + cur, 0),
      updated: moment(
        data
          .map((c) => c.updated.toDate().getTime())
          .reduce((acc, cur) => acc + cur, 0) / data.length
      ),
    };
  }
}
