import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Bank } from './Bank';
import { Branch } from './Branch';
import { WindowToService } from './WindowToService';
import { Appointment } from './Appointment';

@Entity()
export class Window {
  @PrimaryGeneratedColumn("uuid")
  WindowID!: string;

  @ManyToOne(() => Bank, bank => bank.Windows, { onDelete: 'CASCADE' })
  Bank!: Bank;

  @ManyToOne(() => Branch, branch => branch.Windows, { onDelete: 'CASCADE' })
  Branch!: Branch;

  @Column({ type: 'integer' })
  WindowNumber!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Category!: string | null;

  @Column({ type: 'integer', nullable: true })
  CurrentAppointmentID!: number | null;

  @OneToMany(() => WindowToService, windowToService => windowToService.Window)
  WindowServices!: WindowToService[];

  @OneToMany(() => Appointment, appointment => appointment.Window)
  Appointments!: Appointment[];
}