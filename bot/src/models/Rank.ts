import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("rank")
export class Rank {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 22 })
  guild!: string;

  @Column({ type: "varchar", length: 22 })
  user!: string;

  @Column({ type: "integer" })
  lastIncrement!: number;

  @Column({ type: "integer" })
  level!: number;

  @Column({ type: "integer" })
  xp!: number;
}
