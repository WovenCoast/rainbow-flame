import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("reminder")
export class Reminder {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 9 })
  uniqueId: string;

  @Column({ type: "varchar", length: 22 })
  channel: string;

  @Column({ type: "varchar", length: 22 })
  user: string;

  @Column({ type: "integer" })
  end: number;

  @Column({ type: "text" })
  content: string;
}
