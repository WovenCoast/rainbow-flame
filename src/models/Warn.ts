import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("warn")
export class Warn {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 22 })
  guild!: string;

  @Column({ type: "varchar", length: 22 })
  user!: string;

  @Column({ type: "varchar", length: 22 })
  moderator!: string;

  @Column({ type: "integer" })
  time!: number;

  @Column({ type: "text" })
  reason!: string;
}
