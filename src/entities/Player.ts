import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field, Int } from "type-graphql";
import { Play } from "./Play";
import { Turn } from "./Turn";

@ObjectType()
@Entity()
export class Player {

  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({type : 'date'})
  createdAt = new Date();

  @Field(() => String)
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({type : 'text', unique: true})
  name!: string;

  @Field()
  @Property({type : 'text', unique: true})
  email!: string;

  @Property({type : 'text'})
  password!: string;

  @Field(() => String, {nullable: true})
  @Property({type : 'text', nullable: true})
  avatar?: string;

  @Field(() => Int, {nullable: true})
  @Property({nullable: true})
  rank?: number;

  @ManyToMany(() => Play, 'players', {owner: true})
  plays = new Collection<Play>(this);

  @OneToMany(() => Turn, turn => turn.player)
  turns = new Collection<Turn>(this);

 }