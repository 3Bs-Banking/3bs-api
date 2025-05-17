import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from "typeorm";

@Entity()
export class ChurnPrediction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("jsonb")
  customerProfile!: Record<string, any>;

  @Column("varchar", { length: 50 })
  prediction!: "Churn" | "No Churn";

  @CreateDateColumn()
  createdAt!: Date;
}
