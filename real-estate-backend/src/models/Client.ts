import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "clients" })
export class Client extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  unique_slug!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  displayName?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email?: string;
}
