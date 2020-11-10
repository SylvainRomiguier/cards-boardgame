import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import {Player} from "./entities/Player";
import {Card} from "./entities/Card";
import {Play} from "./entities/Play";
import {Set} from "./entities/Set";
import {Turn} from "./entities/Turn";

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
  entities: [Player, Card, Play, Set, Turn],
  baseDir: process.cwd(),
} as Parameters<typeof MikroORM.init>[0];

export default mikroOrmConfig;
