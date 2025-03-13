import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Bank } from './Bank';
import { WindowToService } from './WindowToService';
import { Appointment } from './Appointment';

@Entity()
export class Service {
  @PrimaryGeneratedColumn("uuid")
  ServiceID!: string;

  @ManyToOne(() => Bank, bank => bank.Services, { onDelete: 'CASCADE' })
  Bank!: Bank;

  @Column({ 
    type: 'varchar', 
    length: 255 
  })
  ServiceCategory!: string;

  @Column({ 
    type: 'varchar', 
    length: 255 
  })
  ServiceName!: string;

  @Column({ 
    type: 'text', 
    nullable: true 
  })
  Description!: string | null;

  @Column({ 
    type: 'integer', 
    nullable: true 
  })
  BenchmarkTime!: number | null;

  @OneToMany(() => WindowToService, windowToService => windowToService.Service)
  WindowServices!: WindowToService[];

  @OneToMany(() => Appointment, appointment => appointment.Service)
  Appointments!: Appointment[];
}