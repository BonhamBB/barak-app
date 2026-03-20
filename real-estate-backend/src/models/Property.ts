import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { Client } from "./Client";

@Table({ tableName: "properties" })
export class Property extends Model {
  @ForeignKey(() => Client)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  clientId?: number;

  @BelongsTo(() => Client)
  client?: Client;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: "admin",
  })
  addedBy!: "admin" | "client";

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  address?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  rentPerSqm!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  mgmtFee!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  arnonaPerSqm!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isTechDiscount!: boolean;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 12,
  })
  cleaningFee!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalArea!: number;
}
