import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Window } from "./Window";
import { Service } from "./Service";

@Entity()
export class WindowToService {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Window, (window) => window.windowServices, {
    onDelete: "CASCADE"
  })
  window!: Window;

  @ManyToOne(() => Service, (service) => service.windowServices, {
    onDelete: "CASCADE"
  })
  service!: Service;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
