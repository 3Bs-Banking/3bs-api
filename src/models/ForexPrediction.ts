import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from "typeorm";

@Entity()
export class ForexPrediction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  currency!: "USD" | "GBP";

  @Column("float")
  open!: number;

  @Column("float")
  high!: number;

  @Column("float")
  low!: number;

  @Column("float", { nullable: true })
  predictedClose!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
