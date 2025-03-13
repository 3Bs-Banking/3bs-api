import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Branch } from './Branch';
import { Service } from './Service';
import { Employee } from './Employee';
import { Window } from './Window';
import { Setting } from './Setting';
import { User } from './User';

@Entity()
export class Bank {
  @PrimaryGeneratedColumn("uuid")
  BankID!: string;

  @Column({ type: 'varchar', length: 255 })
  BankName!: string;

  @OneToMany(() => Branch, branch => branch.Bank)
  Branches!: Branch[];

  @OneToMany(() => Service, service => service.Bank)
  Services!: Service[];

  @OneToMany(() => Employee, employee => employee.Bank)
  Employees!: Employee[];

  @OneToMany(() => Window, window => window.Bank)
  Windows!: Window[];

  @OneToMany(() => Setting, setting => setting.Bank)
  Settings!: Setting[];

  @OneToMany(() => User, user => user.Bank)
  Users!: User[];
}