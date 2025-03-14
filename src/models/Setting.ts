import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Bank } from "./Bank";

@Entity()
export class Setting {
  @PrimaryGeneratedColumn("uuid")
  SettingID!: string;

  @ManyToOne(() => Bank, (bank) => bank.Settings, { onDelete: "CASCADE" })
  Bank!: Bank;

  @Column({ type: "varchar", length: 255 })
  Key!: string;

  @Column({ type: "text" })
  Value!: string;
}
