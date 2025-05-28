import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Bank } from "@/models/Bank";

@Entity()
export class FraudPrediction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("jsonb")
  transaction!: Record<string, any>;

  @Column("varchar", { length: 50 })
  prediction!: "Fraud" | "Not Fraud";

  @Column()
  bankId!: string;

  @ManyToOne(() => Bank, (bank) => bank.fraudPredictions, { eager: true })
  @JoinColumn({ name: "bankId" })
  bank!: Bank;

  @CreateDateColumn()
  createdAt!: Date;
}
