import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("settings")
export class Setting {
  @PrimaryColumn({ type: "varchar", length: 22 })
  id: string;

  @Column({ type: "text", default: "{}" })
  settings: string;
}
