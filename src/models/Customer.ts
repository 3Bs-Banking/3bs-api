import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Branch } from './Branch';
import { Appointment } from './Appointment';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  CustomerID!: string;

  @Column({ type: 'varchar', length: 255 })
  FullName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  Email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  PhoneNumber!: string | null;

  @ManyToOne(() => Branch, branch => branch.Customers, { onDelete: 'SET NULL' })
  PreferredBranch!: Branch | null;

  @Column({ type: 'float', nullable: true })
  HomeLatitude!: number | null;

  @Column({ type: 'float', nullable: true })
  HomeLongitude!: number | null;

  @OneToMany(() => Appointment, appointment => appointment.Customer)
  Appointments!: Appointment[];
}