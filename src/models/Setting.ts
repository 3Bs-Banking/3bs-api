import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
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

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
