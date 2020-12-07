import { Field } from "type-graphql";
import {Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Column, ManyToMany, JoinTable} from "typeorm";
import { Card } from "./Card";
import { Play } from "./Play";
import { Player } from "./Player";

@Entity()
export class Turn {
  @Field()
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
  playId: number;

  @ManyToOne(() => Play, play => play.turns)
  play!: Play;

  @Field()
  @Column()
  playerId: number;

  @ManyToOne(() => Player, player => player.turns)
  player!: Player;

  @ManyToMany(() => Card, cardPlayed => cardPlayed.turnsPlayed)
  @JoinTable()
  cardsPlayed: Card[];

  @ManyToMany(() => Card, cardHanded => cardHanded.turnsHanded)
  @JoinTable()
  cardsHanded: Card[];
}
