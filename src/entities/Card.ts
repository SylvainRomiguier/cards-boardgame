import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Field, ObjectType, Int } from "type-graphql";
import { Set } from "./Set";

@ObjectType()
@Entity()
export class Card {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;

  @Field()
  @Property({ type: "text" })
  text!: string;

  @Field()
  @Property()
  value!: number;

  @Field()
  @Property({ type: "text" })
  picture!: string;

  @ManyToMany(() => Set, "cards", { owner: true })
  sets = new Collection<Set>(this);
}
