import {
  Entity,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { User } from "./User";
import { Play } from "./Play";
import { Turn } from "./Turn";

@ObjectType()
@Entity()
export class Player extends User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  rank?: number;

  @Field(() => Boolean)
  @Column({ type: "boolean" })
  active = false;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToMany(() => Play, (play) => play.players)
  @JoinTable()
  plays: Play[];

  @OneToMany(() => Turn, (turn) => turn.player)
  turns: Turn[];
}
