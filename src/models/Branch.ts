import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Bank } from './Bank';
import { Customer } from './Customer';
import { Employee } from './Employee';
import { Window } from './Window';
import { Appointment } from './Appointment';
import { User } from './User';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn("uuid")
  BranchID!: string;

  @ManyToOne(() => Bank, bank => bank.Branches, { onDelete: 'CASCADE' })
  Bank!: Bank;

  @Column({ length: 255 })
  BranchName!: string;

  @Column("varchar",{ length: 255, nullable: true })
  Address!: string | null;

  @Column("varchar",{ length: 100, nullable: true })
  City!: string | null;

  @Column("varchar",{ length: 100, nullable: true })
  State!: string | null;

  @Column("varchar",{ length: 20, nullable: true })
  ZipCode!: string | null;

  @Column("varchar",{ length: 20, nullable: true  })
  ContactNumber!: string | null;

  @Column('float', { nullable: true })
  Latitude!: number | null;

  @Column('float', { nullable: true })
  Longitude!: number | null;

  @Column('int',{ nullable: true})
  TotalCustomerServiceWindows!: number | null;

  @Column('int',{ nullable: true })
  TotalTellerWindows!: number | null;

  @OneToMany(() => Customer, customer => customer.PreferredBranch)
  Customers!: Customer[];

  @OneToMany(() => Employee, employee => employee.Branch)
  Employees!: Employee[];

  @OneToMany(() => Window, window => window.Branch)
  Windows!: Window[];

  @OneToMany(() => Appointment, appointment => appointment.Branch)
  Appointments!: Appointment[];

  @OneToMany(() => User, user => user.Branch)
  Users!: User[];
}