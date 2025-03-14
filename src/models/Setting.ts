import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Bank } from "./Bank";

@Entity()
export class Setting {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Bank, (bank) => bank.settings, { onDelete: "CASCADE" })
  bank!: Bank;

  @Column({ type: "varchar", length: 255 })
  key!: string;

  @Column({ type: "text" })
  value!: string;
}
