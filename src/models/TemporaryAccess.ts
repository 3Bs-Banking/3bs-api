// src/models/TemporaryAccess.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class TemporaryAccess {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", eager: true })
  user!: User; // The user receiving temporary access

  @Column({ type: "varchar", length: 50 })
  previousRole!: string;

  @Column({ type: "varchar", length: 50 })
  newRole!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true, eager: true })
  createdBy!: User | null; // The admin/manager who granted access

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}