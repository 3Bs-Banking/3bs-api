import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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
}
