import { __prod__ } from "./constants";
import { Player } from "./entities/Player";
import { Card } from "./entities/Card";
import { Play } from "./entities/Play";
import { Turn } from "./entities/Turn";
import { Set } from "./entities/Set";
import { Staff } from "./entities/Staff";
import { User } from "./entities/User";

export const typeORMConfig = {
    type: "postgres" as const,
    database: "card-boardgame",
    username: "Sylvain",
    password: "toto",
    logging: !__prod__,
    synchronize: true,
    entities: [User, Player, Staff, Card, Play, Turn, Set],
  };

  export default typeORMConfig;