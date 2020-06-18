import { Provider } from "discord-akairo";
import { Guild } from "discord.js";
import { Repository, InsertResult, DeleteResult } from "typeorm";
import { Setting } from "../models/Settings";
import * as _ from "dot-prop";

export default class SettingsProvider extends Provider {
  public repo: Repository<any>;

  public constructor(repository: Repository<any>) {
    super();
    this.repo = repository;
  }

  public async init(): Promise<void> {
    const settings = await this.repo.find();
    for (const setting of settings) {
      this.items.set(setting.id, JSON.parse(setting.settings));
    }
  }

  public get<T, D>(ref: string | Guild, key: string, defaultValue: D): T | D {
    const id = (this.constructor as typeof SettingsProvider).getID(ref);
    if (this.items.has(id)) {
      return _.get(this.items.get(id), key, defaultValue);
    }
    return defaultValue;
  }

  public getRaw(ref: string | Guild) {
    const id = (this.constructor as typeof SettingsProvider).getID(ref);
    return this.items.get(id);
  }

  public set(
    ref: string | Guild,
    key: string,
    value: any
  ): Promise<InsertResult> {
    const id = (this.constructor as typeof SettingsProvider).getID(ref);
    const data = this.items.get(id) || {};
    _.set(data, key, value);
    this.items.set(id, data);

    return this.repo
      .createQueryBuilder()
      .insert()
      .into(Setting)
      .values({ id, settings: JSON.stringify(data) })
      .onConflict('("id") DO UPDATE SET "settings" = :settings')
      .setParameter("settings", JSON.stringify(data))
      .execute();
  }

  public delete(ref: string | Guild, key: string) {
    const id = (this.constructor as typeof SettingsProvider).getID(ref);
    const data = this.items.get(id) || {};
    _.delete(data, key);

    return this.repo
      .createQueryBuilder()
      .insert()
      .into(Setting)
      .values({ id, settings: JSON.stringify(data) })
      .onConflict('("id") DO UPDATE SET "settings" = :settings')
      .setParameter("settings", JSON.stringify(data))
      .execute();
  }

  public clear(ref: string | Guild): Promise<DeleteResult> {
    const id = (this.constructor as typeof SettingsProvider).getID(ref);
    this.items.delete(id);
    return this.repo.delete(id);
  }

  private static getID(ref: string | Guild): string {
    if (ref instanceof Guild) return ref.id;
    if (ref === "global" || ref === null) return "0";
    if (typeof ref === "string" && /^\d+$/.test(ref)) return ref;
    throw new TypeError(
      `Invalid id specified. Expected a Guild instance, guild ID, "global" or null, got ${ref}`
    );
  }
}
