import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Play } from "./Play";
import { Turn } from "./Turn";

@Entity()
export class Player {

  @PrimaryKey()
  id!: number;

  @Property({type : 'date'})
  createdAt = new Date();

  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({type : 'text'})
  name!: string;

  @Property({type : 'text'})
  email!: string;

  @Property({type : 'text'})
  password!: string;

  @Property({type : 'text'})
  avatar?: string;

  @Property()
  rank?: number;

  @ManyToMany(() => Play, 'players', {owner: true})
  plays = new Collection<Play>(this);

  @OneToMany(() => Turn, turn => turn.player)
  turns = new Collection<Turn>(this);

 }