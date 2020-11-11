import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__, COOKIE_NAME } from "./constants";
import { mikroOrmConfig } from "./mikro-orm.config";
import express from "express";
import redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { CardResolver } from "./resolvers/card";
import { PlayerResolver } from "./resolvers/player";
import { MyContext } from "./types";
import cors from "cors";
import path from "path";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
 
  const RedisStore = connectRedis(session);
  const redisClient = new redis();

  const app = express();

  app.use('/assets', express.static(path.join(__dirname, '..', "assets")));

  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      secret: "My wonderful secret from Langlade", //TODO à passer en variable d'environnement
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: __prod__, // only work in https in production
        sameSite: "lax",
      },
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [CardResolver, PlayerResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res, redis: redisClient }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("server up and running on localhost:4000");
  });
};
main().catch((err) => console.error(err));
