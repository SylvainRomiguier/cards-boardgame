import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToMany} from "typeorm";
import { Field, ObjectType, Int } from "type-graphql";
import { Set } from "./Set";
import { Turn } from "./Turn";

@ObjectType()
@Entity()
export class Card extends BaseEntity{

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column()
  value!: number;

  @Field()
  @Column()
  picture!: string;

  @ManyToMany(() => Set, set => set.cards)
  sets: Set[];

  @ManyToMany(() => Turn, turn => turn.cardsPlayed)
  turnsPlayed: Turn[];

  @ManyToMany(() => Turn, turn => turn.cardsHanded)
  turnsHanded: Turn[];
}
