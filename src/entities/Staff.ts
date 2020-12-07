import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { User } from "./User";

@ObjectType()
@Entity()
export class Staff extends User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Field(() => Boolean)
  @Column({ type: "boolean" })
  admin = false;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
