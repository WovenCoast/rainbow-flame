import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("mute")
export class Mute {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 22 })
  guild: string;

  @Column({ type: "varchar", length: 22 })
  user: string;

  @Column({ type: "varchar", length: 22 })
  moderator: string;

  @Column({ type: "integer" })
  time: number;

  @Column({ type: "integer" })
  end: number;

  @Column({ type: "text" })
  reason: string;

  @Column({ type: "boolean" })
  active: boolean;
}
