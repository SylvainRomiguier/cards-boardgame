import { AnyEntity, MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Card } from "./entities/Card";

export const mikroOrmConfig = {
  migrations: {
    tableName: "mikro_orm_migrations",
    path: "./migrations",
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  dbName: "card-boardgame",
  user: "Sylvain",
  password: "Hyperion30#",
  debug: !__prod__,
  type: "postgresql",
  entities: [Card as AnyEntity],
  baseDir: process.cwd(),
} as Parameters<typeof MikroORM.init>[0];

export default mikroOrmConfig;
