import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";

export const mikroOrmConfig = {
  migrations: {
    tableName: "mikro_orm_migrations",
    path: "./migrations",
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  dbName: "card-boardgame",
  user: "Sylvain",
  password: "toto",
  debug: !__prod__,
  type: "postgresql",
  entities: ['./dist/entities'],
  baseDir: process.cwd(),
} as Parameters<typeof MikroORM.init>[0];

export default mikroOrmConfig;
