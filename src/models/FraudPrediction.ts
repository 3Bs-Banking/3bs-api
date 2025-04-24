import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
  } from "typeorm";
  
  @Entity()
  export class FraudPrediction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;
  
    @Column("jsonb")
    transaction!: Record<string, any>;
  
    @Column("varchar", { length: 50 })
    prediction!: "Fraud" | "Not Fraud";
  
    @CreateDateColumn()
    createdAt!: Date;
  }
  