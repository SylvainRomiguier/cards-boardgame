import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { mikroOrmConfig } from "./mikro-orm.config";
import express from "express";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { CardResolver } from "./resolvers/card";
import { PlayerResolver } from "./resolvers/player";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  const app = express();

  app.use(
    session({
      name: 'sylvain',
      store: new RedisStore({ client: redisClient }),
      secret: "My wonderful secret from Langlade", //TODO à passer en variable d'environnement
      resave: false,
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [CardResolver, PlayerResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server up and running on localhost:4000");
  });
};
main().catch((err) => console.error(err));
