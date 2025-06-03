import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn
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

  @ManyToOne(() => Bank, (bank) => bank.fraudPredictions, { eager: true })
  @JoinColumn({ name: "bank_id" }) 
  bank!: Bank;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
