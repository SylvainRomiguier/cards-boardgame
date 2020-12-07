import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Card } from "./Card";
import { Play } from "./Play";

@Entity()
export class Set {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Play, (play) => play.set)
  plays: Play[];

  @ManyToMany(() => Card, (card) => card.sets)
  @JoinTable()
  cards: Card[];
}
