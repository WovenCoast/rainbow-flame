import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("giveaway")
export class Giveaway {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 22 })
  channel: string;

  @Column({ type: "varchar", length: 22 })
  message: string;

  @Column({ type: "integer" })
  end: number;

  @Column({ type: "text" })
  item: string;
}
