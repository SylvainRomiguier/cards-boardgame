import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Card } from "./entities/Card";
import { mikroOrmConfig } from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  // const card = orm.em.create(Card, {
  //   title: "Garde",
  //   text:
  //     "Désignez une carte non-garde et choisissez un joueur. Si ce joueur a la carte désignée, il est éliminé.",
  //   value: 1,
  //   picture: "some image url"
  // });

  // await orm.em.persistAndFlush(card);
  // const cards = await orm.em.find(Card, {});
  // console.log(cards);
};
main().catch((err) => console.error(err));
