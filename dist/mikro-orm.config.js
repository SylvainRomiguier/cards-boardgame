"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mikroOrmConfig = void 0;
const constants_1 = require("./constants");
const Card_1 = require("./entities/Card");
exports.mikroOrmConfig = {
    migrations: {
        tableName: "mikro_orm_migrations",
        path: "./migrations",
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    dbName: "card-boardgame",
    user: "Sylvain",
    password: "toto",
    debug: !constants_1.__prod__,
    type: "postgresql",
    entities: [Card_1.Card],
    baseDir: process.cwd(),
};
exports.default = exports.mikroOrmConfig;
//# sourceMappingURL=mikro-orm.config.js.map