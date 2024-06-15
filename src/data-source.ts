import "reflect-metadata";
import { DataSource } from "typeorm";
import { Contact } from "./entities/Contact";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [Contact],
  migrations: [],
  subscribers: [],
});
