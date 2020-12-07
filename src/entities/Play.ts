import { Field } from "type-graphql";
import {Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, ManyToMany, Column} from "typeorm";
import { Player } from "./Player";
import { Turn } from "./Turn";
import { Set } from "./Set";

@Entity()
export class Play {

  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Turn, turn => turn.play)
  turns: Turn[];

  @ManyToOne(() => Set, set => set.plays)
  set!: Set;

  @Field()
  @Column()
  setId: number;

  @ManyToMany(() => Player, player => player.plays)
  players: Player[];

}