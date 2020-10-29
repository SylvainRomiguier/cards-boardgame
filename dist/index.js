"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const Card_1 = require("./entities/Card");
const mikro_orm_config_1 = require("./mikro-orm.config");
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.mikroOrmConfig);
    await orm.getMigrator().up();
    const cards = await orm.em.find(Card_1.Card, {});
    console.log(cards);
};
main().catch((err) => console.error(err));
//# sourceMappingURL=index.js.map