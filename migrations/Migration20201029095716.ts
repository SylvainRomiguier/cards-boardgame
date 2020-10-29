import { Migration } from '@mikro-orm/migrations';

export class Migration20201029095716 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "card" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null, "text" text not null, "value" int4 not null, "picture" text not null);');
  }

}
