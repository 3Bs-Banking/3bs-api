import { Entity, ManyToOne, Column, PrimaryGeneratedColumn } from "typeorm";
import { Window } from "./Window";
import { Service } from "./Service";

@Entity()
export class WindowToService {
  @PrimaryGeneratedColumn("uuid")
  ID!: string;

  @ManyToOne(() => Window, (window) => window.WindowServices, {
    onDelete: "CASCADE"
  })
  Window!: Window;

  @ManyToOne(() => Service, (service) => service.WindowServices, {
    onDelete: "CASCADE"
  })
  Service!: Service;
}
