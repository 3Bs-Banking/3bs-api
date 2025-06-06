import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('personal_investment_recommendations')
export class PersonalInvestmentRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  customerID!: string;

  @Column({ length: 12 })
  ISIN!: string;

  @Column({
    type: 'enum',
    enum: ['income', 'balanced', 'aggressive', 'conservative', 'unknown'],
    enumName: 'risk_level_enum'
  })
  riskLevel!: 'income' | 'balanced' | 'aggressive' | 'conservative' | 'unknown';

  @Column({
    type: 'enum',
    enum: ['mass', 'premium', 'professional', 'inactive'],
    enumName: 'customer_type_enum'
  })
  customerType!: 'mass' | 'premium' | 'professional' | 'inactive';

  @Column({
    type: 'enum',
    enum: ['small', 'medium', 'large'],
    enumName: 'investment_capacity_enum'
  })
  investmentCapacity!: 'small' | 'medium' | 'large';

  @Column({
    type: 'enum',
    enum: ['buy', 'sell'],
    enumName: 'transaction_type_enum'
  })
  transactionType!: 'buy' | 'sell';

  @Column('float')
  profitability!: number;

  @Column()
  sector!: string;

  @Column()
  industry!: string;

  @Column({
    type: 'enum',
    enum: ['stock', 'treasury bond', 'mutual fund'],
    enumName: 'asset_category_enum'
  })
  assetCategory!: 'stock' | 'treasury bond' | 'mutual fund';

  @Column('timestamp')
  timestamp!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
